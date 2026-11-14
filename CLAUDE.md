# webner — Claude Code 開発ルール

プロジェクトの要件・依頼元情報は `README.md` を参照すること。

## プロジェクト概要

- webner（葦柏納）商品の **ギャラリーサイト**（EC 風 UI、ただし決済・カート・価格表示なし）＋ **商品管理画面**
- 管理画面では商品の登録・説明文・画像・動画を管理する
- 詳細は `README.md` の「4.2 サイト構成」「4.3 技術構成」を参照

## 開発の進め方

- 変更後は `pnpm typecheck` と `pnpm lint` を通す。画面に触れる変更は dev サーバーを起動して `pnpm e2e`（Playwright スモーク）も通す
- Next.js 16（Cache Components 有効）。この版の作法は `node_modules/next/dist/docs/` を参照する（`AGENTS.md` 参照）。`middleware.ts` ではなく `proxy.ts`
- shadcn/ui は Base UI 版（`@base-ui/react`）。`asChild` ではなく `render` prop、`DropdownMenuLabel` は `DropdownMenuGroup` の中に置く、`Button` を `Link` として描画するときは `nativeButton={false}`
- DB を読む管理ページは `PageSuspense` で包む。クライアントコンポーネントから `db` や `lib/queries` を import しない（`server-only`）
- 管理画面の文言は `lib/i18n/admin.ts` に追加する（繁体字中国語）。画面を増やしたら `lib/management-nav.ts` にナビ項目（パンくずにも使われる）を足す
- 公開サイトの文言は `lib/i18n/public/{de,en,zh-TW,zh-CN}.ts` に 4 言語同時に追加する（型 `PublicDictionary` が揃っていないと型エラーになる）
- 商品の公開状態は `visibility`（draft / hidden / published、`lib/product-visibility.ts`）。公開側の一覧は published のみ、詳細ページは hidden も表示（noindex）。`is_published` は廃止済み
- クライアントからも使う定数（商品ラベル `lib/product-badges.ts`、公開状態 `lib/product-visibility.ts`）は `db/schema` に置かず `lib/` に置き、schema 側がそれを import する（drizzle をクライアントに持ち込まないため）
- 商品フォームは 5 タブ＋上下の固定保存バー。項目を増やすときは `TAB_FIELDS`（product-form.tsx）にフィールド名を登録するとエラー時にそのタブへ切り替わる。`LocalizedField` は `max` で字数カウンタ、`locale`/`onLocaleChange` で言語タブを外から制御できる
- スキーマ変更は `pnpm db:generate` → 生成 SQL を確認（データ移行が要るなら UPDATE を挟む）→ `pnpm db:migrate`。generate が列の作成／リネームを聞いてくる場合は TTY が要る
- 公開サイトの色・フォントは `app/globals.css` の `.site` トークン（`bg-paper` / `text-ink` / `text-ink-2` / `bg-brand` / `bg-tint` / `bg-tint-soft` / `border-line`）だけを使う。方向性は「ドイツのブランドショップ」（白・紺・水色、Lora＋Libre Franklin、長方形ボタン、中央揃え）。shadcn のトークンは管理画面専用
- 公開ページで DB を読むときは `lib/queries/public` の `"use cache"` 関数を使い、管理側の書き込みでは `updateTag`（`lib/cache-tags.ts`）を呼ぶ
- ルートレイアウトは 2 つ（`app/(site)/[locale]/layout.tsx` と `app/(management)/management/layout.tsx`）。`app/layout.tsx` は置かない
- 見た目の変更は `pnpm shoot <paths>` で 390 / 820 / 1440 幅を撮って目視し、`pnpm e2e:site` を通す

## 技術スタック

- **Next.js**（App Router）
- 公開側: `/`、管理画面: `/management` 配下。middleware で分離し、未ログインは管理画面に入れない
- 管理画面の認証: メール（Gmail）＋パスワード、および Google ワンボタンログインの2方式。アカウントは招待制（メールアドレス許可リスト）
- 管理画面の UI 言語は繁体字中国語（zh-TW）。公開側のデフォルト言語はドイツ語（de）
- インフラは開発の最後に決める。開発中はローカル PostgreSQL ＋ ローカルファイル保存で進め、本番は差し替えるだけにする（README 4.4）
  - DB は PostgreSQL。Drizzle 経由でアクセスし、接続先は `DATABASE_URL` のみで切替
  - ファイル保存はストレージインターフェースを挟み、ローカル／S3 互換（R2）を切替可能にする
  - 本番固有の設定（ドメイン、OAuth リダイレクト先、ストレージ公開 URL）はすべて環境変数に置く
- 商品説明はリッチテキスト、動画はファイルアップロードと URL 埋め込みの両対応
- 既存ショップ（japanaceshop.com）へのリンクは設定で ON/OFF できるようにする（将来外す可能性あり）

## Git / Commit ルール

- コミットメッセージは **英語** で書く
- メッセージは **1行のみ**（本文・フッターは付けない）
- `Co-Authored-By: Claude ...` など **Claude 名義の Co-author 行は付けない**
- 形式の例:

```
Add language switcher with de/en/zh-TW/zh-CN order
```

## 参考プロジェクト

- `git@github.com:ppppppsmash/ecommerce-admin`（private、SSH のみ）: 管理画面の **デザインと画面パターン**（shadcn/ui、Heading＋Separator＋DataTable、cell-action、alert-modal、react-hook-form＋zod のフォーム、image-upload のサムネイル UI）を参考にする
- 認証（Clerk）、ORM（Prisma）、画像（Cloudinary）、決済（Stripe）、マルチストア（`[storeId]`）、Size/Color/Billboard/Order は流用しない。詳細は `README.md` の「8. 参考プロジェクト」

## 言語 / i18n

- 対応言語と優先順: ドイツ語 (de) → 英語 (en) → 繁体字中国語 (zh-TW) → 簡体字中国語 (zh-CN)
- 詳細は `README.md` の「4.1 言語仕様」を参照
