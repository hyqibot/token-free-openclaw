<div align="center">

# iClaw

[![GitHub リポジトリ](https://img.shields.io/badge/GitHub-Repo-black.svg?logo=github)](https://github.com/hyqibot/token-free-openclaw)
[![Python](https://img.shields.io/badge/python-3.10%20~%20%3C3.14-blue.svg?logo=python&label=Python)](https://www.python.org/downloads/)
[![ライセンス](https://img.shields.io/badge/license-Apache%202.0-red.svg?logo=apache&label=License)](LICENSE)
[![コードスタイル](https://img.shields.io/badge/code%20style-black-black.svg?logo=python&label=Code%20style)](https://github.com/psf/black)
[![钉钉グループ](https://img.shields.io/badge/DingTalk-Join_Us-orange.svg)](https://qr.dingtalk.com/action/joingroup?code=v1,k1,9O3Nk5uBqF+FKGHas0gK4dkuLhC1CkMJ4CgU45rKMf8=&_dt_no_comment=1&origin=11)

[[中文](iClawREADME_zh.md)] [[English](iClawREADME.md)]


<p align="center"><b>愛するものを愛し、影のようにそばに。</b></p>

</div>

永久にトークン無料の openclaw。3 つの Skill でデスクトップ操作を大きく強化。インストール不要ですぐ使える。WeChat、钉钉（DingTalk）など複数チャネルからの制御に対応。

> **主な特長**
>
> **トークン料金なし** — Web モデル呼び出しにより、クラウド API のトークン料金なしで主要モデルを利用。
>
> **WeChat / DingTalk 対応** — WeChat、DingTalk など複数チャネルから iClaw を制御。
>
> **インストール不要** — 多くの AI プロジェクトはデプロイが複雑なため、本プロジェクトはインストール不要の方式です。プロジェクトをコピーするか exe を直接実行するだけ（Windows 10 以降、Chrome のインストールが必要）。公式参考動画を提供。抖音アカウント **98806056998** をフォローして入手。
>
> **Skill 拡張** — OpenClaw の Skill と互換。さらに強力な拡張も可能（例：自動銘柄選定・自動売買ワークフローなど）。
>
> **AlphaHYQi（計画）** — A 株向けの AI 戦略（発見／学習／進化）。詳細：[A-share-Ai](https://github.com/hyqibot/A-share-Ai/)。
>
> **デスクトップの自由度** — 3 つの Skill で Windows デスクトップ操作を強化（スキルプールに取り込み、必要に応じて有効化）。
>

| Skill 名 | 役割 | 依存 |
|----------|------|------|
| **open_desktop_shortcuts** | ユーザー/共通デスクトップとスタートメニュー Programs 内の `.lnk` / `.url` を名前で **1 件のみ**（先頭一致）起動 | Windows のみ。追加インストール不要 |
| **native_window_control** | ウィンドウ列挙、UI スナップショット、クリック／入力（ネイティブウィンドウ） | Windows |
| **exe_bundle** | 「exe + dll + リソース」を Skill として扱うための約束事 | なし |

### open_desktop_shortcuts

- **場所**（本リポジトリ）: `src/copaw/agents/skills/open_desktop_shortcuts/SKILL.md`（OpenClaw 上流では `skills/open_desktop_shortcuts/` のことが多い）
- **使い方**: 名前指定で **1 つ**のショートカットを開くとき、SKILL の PowerShell で上記フォルダを走査し、**最初に一致した** `.lnk` / `.url` のみ起動。一括起動は本 SKILL の範囲外。
- **インストール不要**: Windows と利用可能な shell／run ツールがあればよい。
- **注意**: Skill フォルダ名は**呼び出し可能なツール名ではありません**。登録済みの **`execute_shell_command`** に、SKILL 内の PowerShell 一行を `command` として渡してください（`open_desktop_shortcuts` という名前のツールを捏造しない）。システムプロンプトに「技能と登録ツール」の固定説明が入ります。

### native_window_control

- **場所**: `skills/native_window_control/`（`SKILL.md`、`scripts/native_window.py`、`scripts/requirements.txt` を含む）
- **依存**: マシンに Python と `pip install pywinauto`（または `pip install -r src/copaw/agents/skills/native_window_control/scripts/requirements.txt`）。
- **使い方**: エージェントが shell から本 Skill の Python スクリプトを実行。例:
  - ウィンドウ一覧: `python scripts/native_window.py list_windows`（作業ディレクトリは Skill ルートまたはスクリプト所在）
  - コントロールスナップショット: `python scripts/native_window.py snapshot "ウィンドウタイトルの一部"`
  - クリック: `python scripts/native_window.py click "ウィンドウタイトル" "ref"`
  - 入力: `python scripts/native_window.py type_text "ウィンドウタイトル" "ref" "入力文字列"`
- スクリプトは標準出力に JSON を出し、エージェントが解釈。

### exe_bundle

- **場所**（本リポジトリ）: `src/copaw/agents/skills/exe_bundle/`（`SKILL.md`、`scripts/README.txt`）
- **使い方**: 「exe + dll + リソース」を Skill の `scripts/<AppName>/` に置き、cwd と起動コマンドを書くための**約束とテンプレート**。具体的な exe 系 Skill を新規作成するときの参考。exe_bundle 自体を単独で「実行」するものではない。

#### 約束事（使い方）

##### ディレクトリ構成（例）

ある Skill（アプリ専用 Skill など）の中:

```text
scripts/MyApp/
  MyApp.exe
  （各種 dll、config、data など）
```

##### 作業ディレクトリ

実行時の **cwd** = `scripts/MyApp`（当該 Skill ルートからの相対パス）。

##### 起動方法

シェルで `scripts/MyApp` に `cd` してから `MyApp.exe` と引数を実行。例:

- 起動のみ: `MyApp.exe`
- 引数付き: `MyApp.exe --config config\app.json`

##### 独自の exe 系 Skill を作るとき

`exe_bundle` の `SKILL.md` をコピー／参考にする: `description` に「ユーザーが何と言ったら発動するか」、本文に cwd・エントリコマンド・よく使う引数の意味。実ファイルは `scripts/<アプリ名>/` に配置。

##### 機密情報

キーを SKILL に書かない。環境変数や同階層の設定ファイルにし、プログラム側で読み取る。

---

本プロジェクトはオープンソース **CoPaw** をベースに二次開発・カスタマイズしたものです（性能・パッケージ形態などを含む）。

## 上流 CoPaw 由来のその他の機能

- **Skills 拡張** — スケジュール、PDF/Office、ニュース要約などを内蔵。**Windows** では上記 3 つのデスクトップ系 Skill と併用可能（`pip install pywinauto` などが必要な場合あり）。カスタム Skill はプールに取り込みエージェントにマウント可能。
- **マルチエージェント** — 複数の独立エージェントを役割分担で作成。協調 Skill で相互に連携し複雑タスクを実行。
- **多層セキュリティ** — ツール保護、ファイルアクセス制御、Skill のセキュリティスキャン。
- **広い接続先** — 钉钉、飞书（Feishu）、WeChat、Discord、Telegram など、必要に応じて接続。

<details>
<summary><b>iClaw でできること</b></summary>

- **SNS**: 毎日のホット投稿要約（小紅書、知乎、Reddit）、B 站／YouTube の新着動画要約。
- **生産性**: メール・Newsletter の要点を钉钉／飞书／QQ へ。メール・カレンダーから連絡先整理。
- **創作・構築**: 就寝前に目標を伝え自動実行、翌朝プロトタイプ取得。企画から動画まで一連の流れ。
- **研究・学習**: テック／AI 情報の追跡、個人ナレッジベースの検索・再利用。
- **デスクトップ・ファイル**: ローカルファイルの整理・検索、文書の閲覧・要約、会話でファイル要求。
- **その他**: Skill と定期実行を組み合わせ、独自の agentic アプリを構築。

</details>


## セキュリティ

iClaw はデータとシステムを守る多層の仕組みを備えています。

- **ツール保護** — 危険なシェル（例: `rm -rf /`、fork 爆弾、リバースシェルなど）をブロック。
- **ファイルアクセスガード** — 機密パス（例: `~/.ssh`、鍵ファイル、システムディレクトリ）へのアクセスを制限。
- **Skill セキュリティスキャン** — インストール前にプロンプトインジェクション、コマンドインジェクション、ハードコードされた秘密、データ流出リスクなどを検査。
- **ローカル運用** — データと記憶は原則ローカル。第三者への自動アップロードはなし（クラウド LLM API 利用時は会話内容が当該プロバイダに送られる）。


## お問い合わせ

**钉钉グループ**: [グループに参加](https://qr.dingtalk.com/action/joingroup?code=v1,k1,9O3Nk5uBqF+FKGHas0gK4dkuLhC1CkMJ4CgU45rKMf8=&_dt_no_comment=1&origin=11)

[<img src="https://img.alicdn.com/imgextra/i2/O1CN01vCWI8a1skHtLGXEMQ_!!6000000005804-2-tps-458-460.png" width="80" height="80" alt="钉钉">](https://qr.dingtalk.com/action/joingroup?code=v1,k1,9O3Nk5uBqF+FKGHas0gK4dkuLhC1CkMJ4CgU45rKMf8=&_dt_no_comment=1&origin=11)



## ライセンス

[Apache License 2.0](LICENSE) で公開しています。

---

# サードパーティ OSS の表記

本製品 **[iClaw]** バージョン **[1.0.0]** には、**Apache License 2.0** に基づき配布されている以下のサードパーティソフトウェアが含まれます。

## 使用しているコンポーネント

### CoPaw
- **プロジェクト名**: CoPaw
- **著作権**: Copyright 2025 The CoPaw Authors（詳細は LICENSE ファイル）
- **入手先**: https://github.com/agentscope-ai/CoPaw
- **ライセンス**: Apache License 2.0
- **本ソフトウェアでの利用**: 改変のうえ統合
- **改変内容**: Skill モジュールの機能拡張、無料トークン接続モジュールの追加、exe 実行・インストール不要形態への対応など。

## ライセンスと免責

### Apache License 2.0
上記コンポーネントは Apache License 2.0 に従います。全文は次で確認できます。
- 本配布物の `LICENSE` ファイル
- または https://www.apache.org/licenses/LICENSE-2.0

### サードパーティコードの免責
**上記サードパーティコンポーネント（CoPaw）について:**  
原著作権者により「現状有姿（AS-IS）」で提供され、商品性、特定目的への適合性、非侵害などいかなる保証もありません。これらの利用に起因する損害について、原著作権者は責任を負いません。

### 当方コードの表記
上記以外のコードは **[iClaw チーム]** が開発または改変したものです。これも「現状有姿（AS-IS）」で提供され、同様に保証はありません。**[iClaw チーム]** は、当該コードの利用または利用不能に起因する直接的・間接的・偶発的・特別・結果的損害（利益・データ・業務中断の損失などを含む）について、たとえその可能性を知らされていたとしても一切責任を負いません。

## 完全なソースコードの入手
Apache License 2.0 の要件に従い、使用している OSS コンポーネントおよびその改変版（ある場合）のソースコードを入手できます。連絡先: 钉钉 **iclaw001**。

## 謝辞
オープンソースコミュニティに貢献してくださるすべての作者に感謝します。
