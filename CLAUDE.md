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
- 商品の公開状態は `visibility`（draft / hidden / published、`lib/product-visibility.ts`）＋ `publishAt`（予約公開）。公開側の一覧は published かつ時刻到来分のみ、詳細ページは hidden も表示（noindex）。`is_published` は廃止済み
- 商品の分類は `product_categories`（複数、順序あり。先頭が主要分類でパンくず・商品カードに使う）。`products.category_id` は廃止済み。入力 UI は `CategoriesField`（チェックボックスツリー）
- 相關商品は `product_relations`（手動、最大 4、順序あり）。空なら同じ分類を 1 つでも共有する商品から自動。公開側は `getRelatedProducts` が両方を扱う
- 公開側の商品クエリは `productsCacheLife()` で cacheLife を決める（予約中の商品があれば `minutes`、なければ `hours`）。1 つの `use cache` 関数内で cacheLife は 1 回だけ呼ぶ
- `loading.tsx` のある公開ページでは `notFound()` が Suspense 内で起きるため HTTP ステータスは 200 のまま。e2e で存在チェックをするときは本文の内容で判定する
- クライアントからも使う定数（商品ラベル `lib/product-badges.ts`、公開状態 `lib/product-visibility.ts`）は `db/schema` に置かず `lib/` に置き、schema 側がそれを import する（drizzle をクライアントに持ち込まないため）
- 保存先は `STORAGE_DRIVER`（local / s3）。s3 は S3 互換（Neon Object Storage、R2 など）で、設定は `S3_ENDPOINT` `S3_REGION` `S3_BUCKET` `S3_ACCESS_KEY_ID` `S3_SECRET_ACCESS_KEY`（Neon が配る `AWS_ENDPOINT_URL_S3` `AWS_REGION` `AWS_ACCESS_KEY_ID` `AWS_SECRET_ACCESS_KEY` も読む。`S3_BUCKET` は必須）。s3 のときブラウザは署名付き URL でストレージへ直接 PUT する（`/api/upload/sign` → PUT → `/api/upload/complete`。Vercel の約 4.5 MB の受信上限を避けるため）。local は従来どおり `/api/upload` 経由。クライアントは `uploadFile`（lib/upload-client.ts）だけを使う
- 画像はアップロード前にブラウザ側で縮小・再圧縮する（`lib/image-compress.ts`、`uploadFile` から呼ぶ）。長辺 2560px、WebP（WebP を書き出せないブラウザは JPEG / PNG）、200KB 未満で縮小不要なもの・GIF・AVIF・1 割以上小さくならないものは原本のまま。10MB の上限は圧縮後のサイズにかかる。既存のファイルは変換されない
- アップロードは `/api/upload` が `media` テーブルに登録する（媒體庫 `/management/media`）。商品側は URL で参照するだけなので、商品削除でファイルを消さない。ファイルの削除は `actions/media.ts` の `deleteMedia`（使用中なら拒否）。商品フォームの画像欄は `MediaPickerDialog` で既存画像を選べる
- 商品の並び順は商品一覧のドラッグ＆ドロップ（dnd-kit）で決める。`reorderProducts`（actions/products.ts）が `sort_order` を 0 から振り直す（`updated_at` を動かさないよう生 SQL）。新規商品は先頭に入る。商品フォームに排序の数字欄は無い。管理側・公開側とも `sort_order` 昇順 → `created_at` 降順
- 並び替えはすべて dnd-kit のドラッグ＆ドロップ（数字入力・矢印ボタンは置かない）。一覧は `DragHandle`（components/management/drag-handle.tsx）＋ `useOptimistic` で放した時点で保存、フォーム内（画像・動画・相關商品）はフォームの値を入れ替えるだけ。分類は同じ階層内だけ動かせる（`reorderCategories`）。新規分類はその階層の末尾に入る
- ファイルを選ぶ UI は `FileDropZone`（components/management/file-drop-zone.tsx）で包み、パソコンからのファイルのドラッグ＆ドロップも受ける（商品画像・動画・説明文エディタ・設定の画像・媒體庫）。`accept` で image / video を指定し、対象外の形式はトーストで拒否する
- 管理用タグは `products.tags`（text[]、公開側には出さない）。候補は `listProductTags()`、入力 UI は `TagsField`
- 商品フォームは 5 タブ＋上下の固定保存バー。項目を増やすときは `TAB_FIELDS`（product-form.tsx）にフィールド名を登録するとエラー時にそのタブへ切り替わる。`LocalizedField` は `max` で字数カウンタ、`locale`/`onLocaleChange` で言語タブを外から制御できる
- Neon（ホスト型 DB）は git 管理外の `.env.neon` で切り替える。スキーマを変えたらローカルの `pnpm db:migrate` に加えて `pnpm db:migrate:neon` も流す。`pnpm dev:neon` で Neon に繋いだ dev サーバー。接続文字列やパスワードは出力・コミットしない
- スキーマ変更は `pnpm db:generate` → 生成 SQL を確認（データ移行が要るなら UPDATE を挟む）→ `pnpm db:migrate`。generate が列の作成／リネームを聞いてくる場合は TTY が要る
- 公開サイトの色・フォントは `app/globals.css` の `.site` トークン（`bg-paper` / `text-ink` / `text-ink-2` / `bg-brand` / `bg-tint` / `bg-tint-soft` / `border-line`）だけを使う。方向性は「ドイツのブランドショップ」（白・紺・水色、Lora＋Libre Franklin、長方形ボタン、中央揃え）。shadcn のトークンは管理画面専用
- 公開ページで DB を読むときは `lib/queries/public` の `"use cache"` 関数を使い、管理側の書き込みでは `updateTag`（`lib/cache-tags.ts`）を呼ぶ
- ルートレイアウトは 2 つ（`app/(site)/[locale]/layout.tsx` と `app/(management)/management/layout.tsx`）。`app/layout.tsx` は置かない
- 【一時的】公開サイト右下の配色切替（上司レビュー用、19 配色）は `components/site/theme-preview/` に閉じている。`<html data-theme>` で `.site` のトークンを上書きするだけで、選択は localStorage、`?theme=<id>` で指定リンクも作れる。外すときはこのフォルダを消し、`app/(site)/[locale]/layout.tsx` の import・`<ThemePreview />`・`suppressHydrationWarning` を削除、採用した色を `app/globals.css` の `.site` に書き写す。消さずに隠すなら `NEXT_PUBLIC_THEME_PREVIEW=0`。本番ビルドでは Basic 認証が有効なときだけ表示される
- Basic 認証は `BASIC_AUTH_USER` と `BASIC_AUTH_PASSWORD` の両方を設定すると有効（`lib/basic-auth.ts`、`proxy.ts` の先頭で判定）。公開ページと管理画面の両方にかかり、`/api/auth`・`/uploads`・静的ファイルは対象外（proxy の matcher 外）。未設定なら無効。公開時は 2 つの環境変数を消すだけ
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
