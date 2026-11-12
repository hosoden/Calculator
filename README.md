# おつかいサポート

## GitHub Pages での公開手順

master ブランチに push すると、GitHub Actions が自動でビルドして GitHub Pages にデプロイします。

- 公開URL: https://hosoden.github.io/Calculator/
- 初回のみ、リポジトリの Settings → Pages → Build and deployment → Source で「GitHub Actions」を選択してください
- ワークフロー: `.github/workflows/deploy.yml`（手動実行も可能: Actions → Deploy to GitHub Pages → Run workflow）
- Vite の `base` を `/Calculator/` に設定しているため、ローカル開発時は `http://localhost:5173/Calculator/` でアクセスします

## Render Static Site での公開手順

このプロジェクトは Vite の静的ビルド成果物を配信する構成に対応しています。無料枠で公開したい場合は、Render の Static Site としてデプロイしてください。

### Render の設定
- Create a Static Site を選択
- Build Command:
  ```bash
  npm install && npm run build
  ```
- Publish Directory:
  ```bash
  dist
  ```

### 補足
- Start Command は Static Site では不要です。
- Basic 認証は Static Site では標準では対応しません。もし認証が必要な場合は Web Service に切り替える必要があります。

