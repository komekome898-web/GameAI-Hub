import type { GameRecord } from "./games";

// Owner-approved author introductions; exact source records are retained in docs.
export const gameIntroductions: GameRecord[] = [
  {
    "slug": "create-monsters",
    "publicationStatus": "published",
    "playAccessNote": "プレイ無料、インストールなし",
    "order": 2,
    "publicationReview": {
      "urlChecked": true,
      "imageChecked": true,
      "permissionConfirmed": true,
      "approved": true
    },
    "title": "クリエイトモンスターズ",
    "description": "集めて、育てて、どこまでも行ける。",
    "genre": "ロールプレイング",
    "playUrl": "https://crimon.pages.dev/",
    "image": {
      "src": "/images/games/create-monsters/battle.jpeg",
      "alt": "戦闘画面",
      "width": 870,
      "height": 1882,
      "credit": "作者提供：ドラ"
    },
    "deviceNote": "開発環境：iPhone\n動作環境：Webブラウザ",
    "developmentNote": "作者はiPhoneだけでゲームを開発しました。ゲームはWebブラウザで動作します。ここでいう開発環境は作者が制作に使った端末を指し、AIサービス側のコード実行環境とは区別しています。",
    "platformNote": "タッチ操作・スマートフォンの縦向きを想定しています。",
    "verifiedDevices": [
      "作者からの確認情報：スマートフォン実機で動作確認済み。",
      "作者の確認記録：iOS、10月10日（端末名・ブラウザは記載なし）。",
      "編集確認：クラウドブラウザで起動・ホーム・設定（2026年10月11日）。"
    ],
    "about": "モンスターを集めて育てる育成RPGです。装備やスキルを組み合わせ、自分だけのパーティを編成します。ダンジョンやアリーナに加え、自動周回の機能もあります。",
    "highlights": [
      "スキルの豊富さ",
      "クリエイトによる幅広い育成",
      "自動周回可能"
    ],
    "howToPlay": [
      "タイトルの「Tap to Start」を選びます。登録せずにホームへ進めます。",
      "ホームの「遊び方」で基本の案内を確認します。",
      "「冒険」からダンジョンへ進みます。"
    ],
    "controls": "タッチ",
    "pricingAndRegistration": "無料・課金なし。登録せずに開始でき、データは利用端末のブラウザに保存されます。クラウド復旧用の登録は任意で、復旧IDとパスワードを使います。メールアドレスは不要です。",
    "author": {
      "name": "ドラ"
    },
    "aiRoles": [
      {
        "name": "Claude・GPT",
        "role": "ゲーム制作に使用。各AIの担当範囲は作者の回答に記載されていません。"
      }
    ],
    "humanContribution": "スキル構成とクリエイトシステムを工夫しました。",
    "updatedAt": "2026-10-11",
    "sources": [
      {
        "label": "作者が公開しているゲーム",
        "href": "https://crimon.pages.dev/"
      }
    ],
    "sourceNote": "ゲーム内容・操作・制作情報は作者提供の紹介をもとに編集しています。スマートフォン実機で動作確認済み、無料・課金なし、インストールなしという本人の追加情報を反映しています。編集時のPCブラウザ確認は初期画面が中心で、編集部による全編プレイは未確認です。"
  },
  {
    "slug": "monster-construction",
    "publicationStatus": "published",
    "playAccessNote": "プレイ無料、インストールなし",
    "order": 3,
    "publicationReview": {
      "urlChecked": true,
      "imageChecked": true,
      "permissionConfirmed": true,
      "approved": true
    },
    "title": "モンスターコンストラクション",
    "description": "モンスターを育成・合体させ、勝利後のカード交換で自分だけの40枚をつくるカードバトルです。",
    "genre": "カードバトル／戦略／モンスター育成・合体",
    "playUrl": "https://cadmium2525.github.io/monster_collection/",
    "image": {
      "src": "/images/games/monster-construction/screen.jpeg",
      "alt": "機械・守護者・幻霊・魔族・狼・岩の巨人を想起させる6体と、古い闘技場、ゲーム名、「TAP TO START」が写ったタイトル画面です。",
      "width": 1280,
      "height": 720,
      "credit": "作者提供：かど"
    },
    "deviceNote": "開発環境：iPhone\n動作環境：Webブラウザ",
    "developmentNote": "作者はiPhoneだけでゲームを開発しました。ゲームはWebブラウザで動作します。ここでいう開発環境は作者が制作に使った端末を指し、AIサービス側のコード実行環境とは区別しています。",
    "platformNote": "スマートフォン・タブレットの横向き用です。縦向きでは「端末を横向きにしてください」と案内されます。PCブラウザにも対応します。実機での推奨ブラウザ・必要性能の詳しい条件は未確認です。",
    "verifiedDevices": [
      "作者からの確認情報：スマートフォン実機で動作確認済み。",
      "提供された確認記録：PCブラウザの1280×720・390×844相当で起動・タイトル表示（2026年10月11日）。"
    ],
    "about": "40枚のデッキで大会に挑み、モンスターの召喚・育成・技・合体を使って戦います。勝利後は相手のカードと交換し、次の大会へ向けてデッキを育てます。手持ちを更新しながら、上位大会と王座を目指します。",
    "highlights": [
      "試合中の育成や修行、特殊合体でモンスターを強くできます。",
      "勝利後に相手のカードを選び、自分のカードと交換できます。",
      "カード交換で更新した40枚のデッキ構成が、次の大会につながります。"
    ],
    "howToPlay": [
      "スマートフォンは横向きにし、タイトルの「TAP TO START」を選びます。初回はスターターから保存デッキを作成し、デッキを選んで大会にエントリーします。カードを選んで盤面に出し、モンスターの技を使って戦います。"
    ],
    "controls": "タッチ：カードをタップし、盤面や対象のモンスターへスワイプ。技は選択後に対象をタップします。PCではマウスのクリック・ドラッグを使います。キーボードだけでの全操作は未確認です。",
    "pricingAndRegistration": "無料・課金なし。ショップのパックにはゲーム内で獲得するダイヤを使う仕組みで、READMEでも完全無料と説明されています。 登録は任意。匿名で開始でき、データ復旧・機種変更のために復旧IDとパスワードを登録できます。メールアドレスの入力は不要です。",
    "author": {
      "name": "かど",
      "socialUrl": "https://x.com/cadmium_2525",
      "socialLabel": "X @cadmium_2525"
    },
    "aiRoles": [
      {
        "name": "Codex",
        "role": "ゲームのプログラム制作。"
      },
      {
        "name": "ImageGen",
        "role": "モンスターやタイトル背景などのイラスト制作。"
      }
    ],
    "humanContribution": "オリジナルカードゲームへの方針転換。",
    "updatedAt": "2026-10-11",
    "sources": [
      {
        "label": "作者が公開しているゲーム",
        "href": "https://cadmium2525.github.io/monster_collection/"
      }
    ],
    "sourceNote": "ゲーム内容・操作・制作情報は作者提供の紹介をもとに編集しています。スマートフォン実機で動作確認済み、無料・課金なし、インストールなしという本人の追加情報を反映しています。編集時のPCブラウザ確認は初期画面が中心で、編集部による全編プレイは未確認です。"
  },
  {
    "slug": "aura-connect-battle",
    "publicationStatus": "published",
    "playAccessNote": "プレイ無料、インストールなし",
    "order": 4,
    "publicationReview": {
      "urlChecked": true,
      "imageChecked": true,
      "permissionConfirmed": true,
      "approved": true
    },
    "title": "オーラコネクト・バトル",
    "description": "同じ色のオーラをつないで消し、仲間とダンジョンを攻略するパズルRPGです。",
    "genre": "パズルRPG／キャラクター育成／チーム編成",
    "playUrl": "https://cadmium2525.github.io/aurapuzzle_-adventure/",
    "image": {
      "src": "/images/games/aura-connect-battle/screen.jpeg",
      "alt": "仲間の人物イラストと色とりどりのオーラ、「TAP TO START」が写った開始画面。",
      "width": 1280,
      "height": 720,
      "credit": "作者提供：かど"
    },
    "deviceNote": "開発環境：iPhone\n動作環境：Webブラウザ",
    "developmentNote": "作者はiPhoneだけでゲームを開発しました。ゲームはWebブラウザで動作します。ここでいう開発環境は作者が制作に使った端末を指し、AIサービス側のコード実行環境とは区別しています。",
    "platformNote": "スマートフォンの縦向きを中心にした画面構成です。PCブラウザからも起動できます。実機での推奨ブラウザ・必要性能の詳しい条件は未確認です。",
    "verifiedDevices": [
      "作者からの確認情報：スマートフォン実機で動作確認済み。",
      "提供された確認記録：PCブラウザの1280×720・390×844相当で起動・タイトル表示（2026年10月11日）。"
    ],
    "about": "オーラをつないで攻撃や回復を行い、敵とのバトルを進めます。仲間を編成・強化・進化させ、サポートキャラクターと一緒にダンジョンへ出撃します。盤面のつなぎ方と、チームの組み合わせを考える楽しさがあります。",
    "highlights": [
      "同じ色のオーラを4つ以上つないで消すパズルです。",
      "3人の仲間と1人のサポートでチームを組みます。",
      "強化・進化・開眼など、仲間を育てる要素があります。"
    ],
    "howToPlay": [
      "読み込み後の「TAP TO START」を選びます。ホームからダンジョンを開き、ステージ・チーム・サポートを選び、編成を確認して「突入」で開始します。初期の案内に沿って編成を整えると進めやすくなります。"
    ],
    "controls": "タッチでオーラをなぞってつなぎ、メニューやスキルをタップします。PCではマウスのドラッグとクリックを使います。キーボードだけで一通り遊べるかは未確認です。",
    "pricingAndRegistration": "無料・課金なし。 登録は任意。ゲストとして開始でき、別端末へのデータ引き継ぎ・復旧のためにIDとパスワードを登録する仕組みがあります。メールアドレスの入力は不要です。",
    "author": {
      "name": "かど",
      "socialUrl": "https://x.com/cadmium_2525",
      "socialLabel": "X @cadmium_2525"
    },
    "aiRoles": [
      {
        "name": "Codex（Sol・astra）",
        "role": "ゲーム本体の制作。"
      }
    ],
    "humanContribution": "",
    "updatedAt": "2026-10-11",
    "sources": [
      {
        "label": "作者が公開しているゲーム",
        "href": "https://cadmium2525.github.io/aurapuzzle_-adventure/"
      }
    ],
    "sourceNote": "ゲーム内容・操作・制作情報は作者提供の紹介をもとに編集しています。スマートフォン実機で動作確認済み、無料・課金なし、インストールなしという本人の追加情報を反映しています。編集時のPCブラウザ確認は初期画面が中心で、編集部による全編プレイは未確認です。"
  },
  {
    "slug": "tomoshibi",
    "publicationStatus": "published",
    "playAccessNote": "プレイ無料、インストールなし",
    "order": 5,
    "publicationReview": {
      "urlChecked": true,
      "imageChecked": true,
      "permissionConfirmed": true,
      "approved": true
    },
    "title": "灯のルミナ",
    "description": "少女ルミナを守り、灯りを頼りに暗い地下聖堂を進む謎解きアクションです。",
    "genre": "謎解きアクション／横スクロール／冒険",
    "playUrl": "https://cadmium2525.github.io/tomoshibi/",
    "image": {
      "src": "/images/games/tomoshibi/screen.jpeg",
      "alt": "灯竿を掲げるグレイと、手をつないだルミナ、暗い地下聖堂が写ったタイトル画面です。画面には「第1章 忘れられた地下聖堂」と表示されています。",
      "width": 1280,
      "height": 720,
      "credit": "作者提供：かど"
    },
    "deviceNote": "開発環境：iPhone\n動作環境：Webブラウザ",
    "developmentNote": "作者はiPhoneだけでゲームを開発しました。ゲームはWebブラウザで動作します。ここでいう開発環境は作者が制作に使った端末を指し、AIサービス側のコード実行環境とは区別しています。",
    "platformNote": "スマートフォン・タブレットは横向きを推奨。縦向きでは上側にゲーム、下側にコントローラーを置く構成です。PCブラウザにも対応します。実機での推奨ブラウザ・必要性能の詳しい条件は未確認です。",
    "verifiedDevices": [
      "作者からの確認情報：スマートフォン実機で動作確認済み。",
      "提供された確認記録：PCブラウザの1280×720・390×844相当で起動・タイトル表示（2026年10月11日）。"
    ],
    "about": "老紳士グレイを操作して、少女ルミナとともにダンジョンを進みます。灯竿で影を退けながら、ルミナを呼ぶ・待たせる・助ける行動を使い、扉や足場の仕掛けを解きます。自分だけで先へ進むのではなく、二人で無事に進むことが攻略の鍵です。",
    "highlights": [
      "少女を守りながら進む、同行者のいるアクションです。",
      "ルミナと押し石、石板、レバーなどを組み合わせて仕掛けを解きます。",
      "ドット絵風の世界と、暗闇に灯る光の雰囲気を楽しめます。"
    ],
    "howToPlay": [
      "タイトル画面でZ／Enterを押します。タッチ端末では画面をタップして開始します。プロローグを見た後、グレイとルミナで地下聖堂を進みます。操作説明はポーズ画面でも確認できます。"
    ],
    "controls": "タッチ：スティックで移動、ジャンプ・灯竿・呼ぶのボタンを使用。PC：左右キーで移動、Z／Spaceでジャンプ、Xで灯竿、Cで「待て／おいで」、下キー長押しで手を差し伸べる、上キーでレバー、Enter／Escでポーズ。ゲームパッドにも対応する設計です。",
    "pricingAndRegistration": "無料・課金なし。 登録は不要。アカウント登録画面はなく、ブラウザからそのまま遊べます。",
    "author": {
      "name": "かど",
      "socialUrl": "https://x.com/cadmium_2525",
      "socialLabel": "X @cadmium_2525"
    },
    "aiRoles": [
      {
        "name": "ChatGPT",
        "role": "企画とイラスト生成。"
      },
      {
        "name": "Claude Code（Opus・Sonnet）",
        "role": "コーディング。"
      },
      {
        "name": "Grok",
        "role": "モーション用動画の生成。"
      }
    ],
    "humanContribution": "操作感やモーションについて工夫しました。",
    "updatedAt": "2026-10-11",
    "sources": [
      {
        "label": "作者が公開しているゲーム",
        "href": "https://cadmium2525.github.io/tomoshibi/"
      }
    ],
    "sourceNote": "ゲーム内容・操作・制作情報は作者提供の紹介をもとに編集しています。スマートフォン実機で動作確認済み、無料・課金なし、インストールなしという本人の追加情報を反映しています。編集時のPCブラウザ確認は初期画面が中心で、編集部による全編プレイは未確認です。"
  },
  {
    "slug": "punching",
    "publicationStatus": "published",
    "playAccessNote": "プレイ無料、インストールなし",
    "order": 6,
    "publicationReview": {
      "urlChecked": true,
      "imageChecked": true,
      "permissionConfirmed": true,
      "approved": true
    },
    "title": "ぶっ飛ばせ！ムカつくアイツ！",
    "description": "5回のミニゲームでパンチ力をためて、キャラクターを宇宙の向こうまでぶっ飛ばす爽快ゲームです。",
    "genre": "ハイパーカジュアル／ミニゲーム／スコアアタック",
    "playUrl": "https://cadmium2525.github.io/punching/",
    "image": {
      "src": "/images/games/punching/screen.png",
      "alt": "ゲーム名、既定のキャラクター、パンチの演出、「ゲームスタート」などのメニューが写ったタイトル画面です。",
      "width": 1280,
      "height": 720,
      "credit": "作者提供：かど"
    },
    "deviceNote": "開発環境：iPhone\n動作環境：Webブラウザ",
    "developmentNote": "作者はiPhoneだけでゲームを開発しました。ゲームはWebブラウザで動作します。ここでいう開発環境は作者が制作に使った端末を指し、AIサービス側のコード実行環境とは区別しています。",
    "platformNote": "スマートフォンの縦向きが基本です。PCでも縦長のゲーム画面をマウスで操作できます。実機での推奨ブラウザ・必要性能の詳しい条件は未確認です。",
    "verifiedDevices": [
      "作者からの確認情報：スマートフォン実機で動作確認済み。",
      "提供された確認記録：PCブラウザの1280×720・390×844相当で起動・タイトル表示（2026年10月11日）。"
    ],
    "about": "毎回選ばれる5つのミニゲームで、タイミングや連打の精度を競います。ためた力でフィニッシュパンチを放ち、飛距離を伸ばします。短いプレイの中で、上手く決まったときの派手な演出と記録更新を楽しめます。",
    "highlights": [
      "10種類のミニゲームから、毎回5種類が選ばれます。",
      "タイミングの精度によってパンチ力と飛距離が変わります。",
      "全PERFECTでGOD PUNCHを狙えます。"
    ],
    "howToPlay": [
      "タイトルの「ゲームスタート」を選ぶと、5回のミニゲームが始まります。相手を変える場合は先に「キャラクター選択」を開きます。各ミニゲームの案内に合わせて操作し、最後のパンチと飛行結果へ進みます。"
    ],
    "controls": "タッチまたはマウスで、タイミングよく押す・連打する・指定位置を狙うなどの操作をします。一部の入力はSpace／Enterにも対応しますが、位置を狙う操作にはタッチまたはマウスを使います。",
    "pricingAndRegistration": "無料・課金なし。 登録は不要。メールアドレスやパスワードを登録せずに開始できます。オンラインランキングには内部的な匿名認証を使う構成です。",
    "author": {
      "name": "かど",
      "socialUrl": "https://x.com/cadmium_2525",
      "socialLabel": "X @cadmium_2525"
    },
    "aiRoles": [
      {
        "name": "ChatGPT",
        "role": "企画。"
      },
      {
        "name": "Claude Code（Opus・Sonnet）",
        "role": "コーディング。"
      }
    ],
    "humanContribution": "作者の言葉では「ドパれるか」を意識して制作しました。",
    "updatedAt": "2026-10-11",
    "sources": [
      {
        "label": "作者が公開しているゲーム",
        "href": "https://cadmium2525.github.io/punching/"
      }
    ],
    "sourceNote": "ゲーム内容・操作・制作情報は作者提供の紹介をもとに編集しています。スマートフォン実機で動作確認済み、無料・課金なし、インストールなしという本人の追加情報を反映しています。編集時のPCブラウザ確認は初期画面が中心で、編集部による全編プレイは未確認です。"
  },
  {
    "slug": "rakugaction",
    "publicationStatus": "published",
    "playAccessNote": "プレイ無料、インストールなし",
    "order": 7,
    "publicationReview": {
      "urlChecked": true,
      "imageChecked": true,
      "permissionConfirmed": true,
      "approved": true
    },
    "title": "ラクガキアクション",
    "description": "描いたラクガキが立体になって、5つのステージを冒険する3Dアクションです。",
    "genre": "お絵かき／3Dアクション／探索／タイムアタック",
    "playUrl": "https://cadmium2525.github.io/rakugaction/",
    "image": {
      "src": "/images/games/rakugaction/screen.png",
      "alt": "赤いドラゴン形のキャラクターが草原を進む自動デモです。川・足場・星・ミニマップが写っています。",
      "width": 1280,
      "height": 720,
      "credit": "作者提供：かど"
    },
    "deviceNote": "開発環境：iPhone\n動作環境：Webブラウザ",
    "developmentNote": "作者はiPhoneだけでゲームを開発しました。ゲームはWebブラウザで動作します。ここでいう開発環境は作者が制作に使った端末を指し、AIサービス側のコード実行環境とは区別しています。",
    "platformNote": "スマートフォンは横向き。iPhone Safari・Android Chromeを優先した設計で、PCブラウザにも対応します。端末別の性能の詳しい条件は未確認です。",
    "verifiedDevices": [
      "作者からの確認情報：スマートフォン実機で動作確認済み。",
      "提供された確認記録：PCブラウザの1280×720・390×844相当で起動・タイトル表示（2026年10月11日）。"
    ],
    "about": "自分で描いたキャラクターで、星を集めながらステージを攻略します。体の形によって能力やアクションが変わるので、見た目をつくることと攻略がつながっています。全5ステージを通して走るタイムアタックもあります。",
    "highlights": [
      "人型だけでなく、四足・多腕・翼のあるキャラクターなども描けます。",
      "描いたパーツや体型から、能力・動き・コンボが変わります。",
      "星集めとステージ探索に加え、タイムアタックで記録を追求できます。"
    ],
    "howToPlay": [
      "起動時にデモが流れている場合は、画面をタップしてタイトルに戻ります。「ラクガキを描く」でパーツを描き、3Dプレビューを確認してキャラクターを保存します。「はじめる」または「ステージであそぶ」からステージを選んで開始します。"
    ],
    "controls": "タッチ：左側の仮想スティックで移動、右下のJUMP・ACTIONでジャンプや攻撃、画面右側のスワイプでカメラ操作。PC：WASD／矢印で移動、Space／Zでジャンプ、X／J／Shiftでアクション、Esc／Pで一時停止。お絵かきはタッチまたはマウス。",
    "pricingAndRegistration": "無料・課金なし。 登録は不要。キャラクターや進行は端末内に保存できます。ランキング送信は任意で、プレイヤーによるログイン操作は不要の仕組みです。",
    "author": {
      "name": "かど",
      "socialUrl": "https://x.com/cadmium_2525",
      "socialLabel": "X @cadmium_2525"
    },
    "aiRoles": [
      {
        "name": "ChatGPT",
        "role": "企画。"
      },
      {
        "name": "Claude Code（Opus・Sonnet）",
        "role": "コーディング。"
      }
    ],
    "humanContribution": "コンセプトがブレないように気を付けながら、お絵かきUIを実際に触り、AIに調整を依頼しました。",
    "updatedAt": "2026-10-11",
    "sources": [
      {
        "label": "作者が公開しているゲーム",
        "href": "https://cadmium2525.github.io/rakugaction/"
      }
    ],
    "sourceNote": "ゲーム内容・操作・制作情報は作者提供の紹介をもとに編集しています。スマートフォン実機で動作確認済み、無料・課金なし、インストールなしという本人の追加情報を反映しています。編集時のPCブラウザ確認は初期画面が中心で、編集部による全編プレイは未確認です。"
  },
  {
    "slug": "sumaraku",
    "publicationStatus": "published",
    "playAccessNote": "プレイ無料、インストールなし",
    "order": 8,
    "publicationReview": {
      "urlChecked": true,
      "imageChecked": true,
      "permissionConfirmed": true,
      "approved": true
    },
    "title": "ラクガキ大乱闘",
    "description": "自分で描いたラクガキを3Dファイターにして戦わせる、お絵かき対戦アクションです。",
    "genre": "お絵かき／対戦アクション／3D",
    "playUrl": "https://cadmium2525.github.io/sumaraku/",
    "image": {
      "src": "/images/games/sumaraku/screen.png",
      "alt": "ゲーム名と「ラクガキする」「自分で戦う（CPU戦）」などのメニューが並ぶ初期タイトル画面です。",
      "width": 1280,
      "height": 720,
      "credit": "作者提供：かど"
    },
    "deviceNote": "開発環境：iPhone\n動作環境：Webブラウザ",
    "developmentNote": "作者はiPhoneだけでゲームを開発しました。ゲームはWebブラウザで動作します。ここでいう開発環境は作者が制作に使った端末を指し、AIサービス側のコード実行環境とは区別しています。",
    "platformNote": "スマートフォン・タブレットのタッチ操作を想定。対戦は横向きで遊ぶと操作しやすい構成です。PCブラウザにも対応します。実機での推奨ブラウザ・必要性能の詳しい条件は未確認です。",
    "verifiedDevices": [
      "作者からの確認情報：スマートフォン実機で動作確認済み。",
      "提供された確認記録：PCブラウザの1280×720・390×844相当で起動・タイトル表示（2026年10月11日）。"
    ],
    "about": "頭・体・腕・足などを描くと、ラクガキが立体のキャラクターになります。生まれたファイターでCPUと戦ったり、オートバトルを楽しんだりできます。タイプはランダムに割り当てられ、タイプに応じて戦い方やワザが変わります。",
    "highlights": [
      "描いた線や塗りが立体になり、動き出します。",
      "キャラクターのタイプに応じて戦い方やワザが変わります。",
      "自分で操作するCPU戦と、観戦できるオートバトルがあります。"
    ],
    "howToPlay": [
      "タイトルの「ラクガキする」を選び、ガイドに沿って各パーツを描き、キャラ化して名前を付けます。その後「自分で戦う（CPU戦）」などを選び、使用キャラ・相手・CPUの強さを選んで開始します。初回は先に自分のキャラクターを作ります。"
    ],
    "controls": "タッチ：左側のスティックと、攻撃・必殺・ジャンプ・ガードのボタン。お絵かきは指でなぞります。PC：矢印キー／WASDで移動、Jで攻撃、Kで必殺、Spaceでジャンプ、Lでガード。お絵かきはマウスでもできます。",
    "pricingAndRegistration": "無料・課金なし。 登録は不要。プレイヤー名の設定はできますが、メールアドレスやパスワードの入力は不要です。ラクガキ共有・レート戦などのオンライン機能では内部的に匿名認証を使う仕組みです。",
    "author": {
      "name": "かど",
      "socialUrl": "https://x.com/cadmium_2525",
      "socialLabel": "X @cadmium_2525"
    },
    "aiRoles": [
      {
        "name": "ChatGPT",
        "role": "企画。"
      },
      {
        "name": "Claude Code（Opus・Sonnet）",
        "role": "コーディング。"
      }
    ],
    "humanContribution": "コンセプトがブレないように気を付けながら、お絵かきUIを実際に触り、AIに調整を依頼しました。",
    "updatedAt": "2026-10-11",
    "sources": [
      {
        "label": "作者が公開しているゲーム",
        "href": "https://cadmium2525.github.io/sumaraku/"
      }
    ],
    "sourceNote": "ゲーム内容・操作・制作情報は作者提供の紹介をもとに編集しています。スマートフォン実機で動作確認済み、無料・課金なし、インストールなしという本人の追加情報を反映しています。編集時のPCブラウザ確認は初期画面が中心で、編集部による全編プレイは未確認です。"
  }
];
