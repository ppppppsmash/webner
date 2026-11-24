# 把图片和视频迁移到 Cloudflare R2（加 CDN）操作备忘

整理日期：2026-11-23
相关分支：`feature/r2-migration`（尚未合并到 `main`）

## 0. 这次要做什么

把**图片和视频文件**的存放位置从 Neon 的对象存储（美国东部）换成 Cloudflare R2，并通过自定义域名让文件经过 Cloudflare 的全球 CDN。

| Neon 提供的东西 | 存放什么 | 迁移之后 |
|---|---|---|
| 数据库（Postgres） | 商品、分类、账号、设置等资料 | **继续用 Neon，不变** |
| 对象存储 | 图片和视频文件 | **换成 Cloudflare R2** |

`DATABASE_URL` 不要改。Neon 这个服务要一直保留。

### 能改善什么

| 内容 | 现在 | 迁移后 |
|---|---|---|
| 视频文件 | 浏览器直连美国的存储 | 变快，效果最明显 |
| 商品说明里的图片 | 浏览器直连美国的存储 | 变快 |
| 后台的缩略图 | 浏览器直连美国的存储 | 变快 |
| 前台的商品图、缩略图 | 经过 Vercel 的图片优化 | 基本不变 |

### 不能解决什么

前台商品详情页"缩略图显示不出来"的问题，原因还没有确认。如果原因是 Vercel 的图片优化额度用完，这次迁移**不会**修好它。请另外确认下面任意一项：

- Vercel 项目的 Usage 页面里，Image Optimization 是否已用满；
- 或者在出问题的页面按 F12 → Network，看失败图片的状态码。

| 状态码 | 含义 |
|---|---|
| 402 | Vercel 额度用完 |
| 504 / 500 | 取原图失败或超时 |
| 400 | 请求的尺寸或域名不被允许（线上构建配置有问题） |

## 1. 顺序总览

顺序不能颠倒。**必须先部署（第 4 步），再迁移（第 5 步）。** 否则数据库已经指向新域名，而线上还不允许这个域名，图片会全部显示不出来。

1. Cloudflare：建存储桶、绑定自定义域名、设置 CORS、创建 API 令牌
2. 把分支 `feature/r2-migration` 合并到 `main`
3. Vercel：设置环境变量
4. 重新部署
5. 本地：执行迁移脚本
6. 再部署一次（刷新前台缓存）
7. 确认
8. 收尾：删除过渡用的环境变量，清空旧存储

## 2. Cloudflare 上的操作

按钮名称按 Cloudflare 官方文档原文书写。

### 2-0. 前提：域名要在 Cloudflare 上

自定义域名必须是**同一个 Cloudflare 账号里的域名**。域名在别处注册的话，要先添加到 Cloudflare（改 DNS 服务器，或用 CNAME 方式部分接入）。

### 2-1. 创建存储桶

1. 登录 Cloudflare 后台，进入 **R2 object storage**。
2. 创建一个存储桶，例如 `webner-media`。
   - 名字只能用小写字母、数字和连字符，3 到 63 个字符，不能以连字符开头或结尾。
   - 如果有区域选项，选亚太（APAC）或自动。

> 官方文档的这一页只写了命令行做法，后台的按钮名称和区域选项没有核对到。

### 2-2. 绑定自定义域名

1. 在 **R2 object storage** 里点进存储桶，打开 **Settings**。
2. 在 **Custom Domains** 下面点 **Add**。
3. 输入域名（例如 `media.你的域名.com`），点 **Continue**。
4. 确认要添加的 DNS 记录，点 **Connect Domain**。
5. 等状态从 **Initializing** 变成 **Active**（通常几分钟）。
   - 一直不变的话：存储桶旁边的 **...** → **Retry connection**。

不要用 `r2.dev` 的开发地址：有限速，只能用于开发，而且没有缓存。

### 2-3. 设置 CORS

后台上传图片是浏览器直接传到存储的，所以必须设置。

1. 同一个存储桶的 **Settings** → **CORS Policy** → **Add CORS policy**。
2. 切到 **JSON** 标签，粘贴下面的内容，把域名换成网站的实际地址，点 **Save**。

```json
[
  {
    "AllowedOrigins": ["https://你的网站域名", "http://localhost:3000"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type", "Cache-Control"],
    "MaxAgeSeconds": 3600
  }
]
```

注意：

- `AllowedOrigins` 只写到域名为止，不能带路径，结尾不要加 `/`。
- 网站有多个地址时（例如 `xxx.vercel.app` 和正式域名）都要列进去。
- 修改后最多 30 秒生效。
- 这个 JSON 的字段名是后台用的写法（首字母大写）。命令行工具 Wrangler 用的是另一种格式，不要混用。

### 2-4. 创建 API 令牌

1. 回到 **R2 object storage** 首页，在 **Account Details** 里点 **API Tokens** 旁边的 **Manage**。
2. 点 **Create Account API token**。
3. **Permissions** 选 **Object Read & Write**，范围限定到刚建的存储桶。
4. 点 **Create Account API token** 完成创建。
5. 页面会显示 **Access Key ID** 和 **Secret Access Key**。
   - **Secret Access Key 只显示这一次**，离开页面后无法再查看，请立即保存。
6. 记下账户的 S3 端点地址：`https://<账户ID>.r2.cloudflarestorage.com`

密钥不要提交到 git，也不要发到聊天里。

## 3. 合并分支

```
git checkout main
git merge --ff-only feature/r2-migration
git push origin main
```

这个分支包含：

- `scripts/migrate-storage.ts`：迁移脚本（命令 `pnpm media:migrate`）
- `next.config.ts`：新增 `S3_LEGACY_PUBLIC_URL`，过渡期同时放行旧的图片域名

## 4. Vercel 上设置环境变量并部署

| 变量 | 值 |
|---|---|
| `S3_ENDPOINT` | `https://<账户ID>.r2.cloudflarestorage.com` |
| `S3_REGION` | `auto` |
| `S3_BUCKET` | R2 存储桶名，例如 `webner-media` |
| `S3_ACCESS_KEY_ID` | 令牌的 Access Key ID |
| `S3_SECRET_ACCESS_KEY` | 令牌的 Secret Access Key |
| `S3_PUBLIC_URL` | `https://media.你的域名.com`（结尾不加 `/`） |
| `S3_LEGACY_PUBLIC_URL` | 现在 Neon 存储的公开地址：`<Neon 存储的端点地址>/<Neon 的存储桶名>` |

- `STORAGE_DRIVER` 保持 `s3`。
- `DATABASE_URL` 等数据库相关的变量**不要动**。
- 如果 Vercel 上原来用的是 `AWS_ENDPOINT_URL_S3`、`AWS_ACCESS_KEY_ID` 这些 Neon 给的变量名，可以留着：`S3_` 开头的变量优先级更高。迁移全部完成后再删。
- `S3_LEGACY_PUBLIC_URL` 的值就是数据库里现有图片地址中，文件路径（`/images/...`）之前的那一段。

设置完后**重新部署**。图片域名的许可是在构建时决定的，只改环境变量不重新部署不会生效。

部署后的状态：新上传的文件进 R2；旧文件还在 Neon 存储，页面仍然指向旧地址，照常显示。

## 5. 本地执行迁移

1. 把第 4 步表格里前 6 个变量（`S3_ENDPOINT` 到 `S3_PUBLIC_URL`）写进本地的 `.env.neon`。
   - `DATABASE_URL` 不要动。
   - `.env.neon` 里原有的 `S3_BUCKET` 要改成 R2 的存储桶名。
2. 空跑，确认列表（不写入任何东西）：

```
pnpm media:migrate
```

   2026-11-23 的空跑结果：共 8 个文件（1 个 98 MB 的视频，7 张图片合计不到 0.5 MB）。

3. 实际执行：

```
pnpm media:migrate --apply
```

脚本对每个文件做的事：

1. 从旧地址下载，用**相同的文件路径**上传到 R2；
2. 确认 R2 上的文件大小一致；
3. 在一个事务里把数据库中所有指向旧地址的地方改成新地址（媒体库、商品图片、商品视频、商品说明里的图片、站点设置）。

特点：

- 旧存储里的文件**不会删除**。
- 某个文件失败时，该文件留在旧存储，数据库不变，其他文件继续。
- 可以重复运行，只处理还没迁移的文件。
- 迁移清单写到 `scripts/output/migrate-<时间>.json`（不进 git）。

## 6. 再部署一次

前台页面有几小时的缓存。重新部署一次，或在后台保存任意一个商品，前台就会切到新地址。

## 7. 确认

- 前台首页、商品列表、商品详情页的图片都能显示。
- 商品详情页的视频能播放。
- 后台媒体库的缩略图能显示。
- 在后台新上传一张图片，能成功，且地址是 `https://media.你的域名.com/...`。
  - 上传失败并提示跨域（CORS）错误时，回到 2-3 检查 `AllowedOrigins` 是否包含当前的网站地址。
- 确认 CDN 缓存是否生效：对同一个文件请求两次，看响应头里的 `cf-cache-status` 第二次是否为 `HIT`。

```
curl -sI https://media.你的域名.com/<某个文件的路径> | grep -i cf-cache-status
```

   Cloudflare 默认只缓存特定类型的文件。如果 `.webp` 或 `.mp4` 一直不是 `HIT`，需要在 Cloudflare 上给这个域名加一条"缓存全部"的规则。

## 8. 收尾

确认前台已经全部使用新地址之后：

1. 删除 Vercel 上的 `S3_LEGACY_PUBLIC_URL`，重新部署。
2. 删除 Vercel 上不再使用的 Neon 存储变量（`AWS_ENDPOINT_URL_S3`、`AWS_REGION`、`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`）。
3. 清空 Neon 对象存储里的旧文件。
   - 其中也包括上次批量压缩后留下的原图。清单在 `scripts/output/recompress-s3-2026-11-23T09-09-09-560Z.json`。
   - 注意：`.env.neon` 改成指向 R2 之后，`pnpm media:recompress:neon --delete-originals` 删除的对象会变成 R2，**不能再用它来删 Neon 上的旧文件**。请在 Neon 的后台直接清空。

## 9. 想退回去的时候

旧文件一直留在 Neon 存储里，所以可以退回：

1. 把 Vercel 和 `.env.neon` 的 `S3_*` 变量改回 Neon 存储的值（或删掉 `S3_*`，让 `AWS_*` 生效），`S3_LEGACY_PUBLIC_URL` 改成 R2 的公开地址。
2. 重新部署。
3. 运行 `pnpm media:migrate --apply`，脚本会把文件复制回去并把数据库地址改回来。

迁移之后新上传到 R2 的文件也会被一并复制回去。

## 10. 费用

R2 每月免费额度：10 GB 存储、100 万次写入类操作、1000 万次读取类操作。流量不收费。现在全部文件约 100 MB。

## 11. 没有验证过的地方

- 迁移脚本在本地用 S3 兼容的测试服务和数据库副本完整跑通过（21 个文件），**没有在真正的 R2 上跑过**。
- CORS 的 JSON 按官方文档的格式写，没有在 R2 后台实际保存过。
- `S3_REGION=auto` 是项目代码里对 R2 的既定写法，这次查到的文档页面没有提到这个值。
- `.webp` 和 `.mp4` 是否在 Cloudflare 的默认缓存范围内，没有核实，见第 7 步。

## 参考

- <https://developers.cloudflare.com/r2/buckets/public-buckets/>
- <https://developers.cloudflare.com/r2/buckets/cors/>
- <https://developers.cloudflare.com/r2/api/tokens/>
- <https://developers.cloudflare.com/r2/pricing/>
