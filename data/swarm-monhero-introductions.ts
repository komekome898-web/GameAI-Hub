import type { GameRecord } from "./games";

// Author-approved submissions and reviewed publication images; merge remains subject to owner review.
export const swarmMonheroIntroductions: GameRecord[] = [
  {
    "slug": "swarm-front",
    "publicationStatus": "published",
    "order": 9,
    "publicationReview": {
      "urlChecked": true,
      "imageChecked": true,
      "permissionConfirmed": true,
      "approved": true
    },
    "title": "SWARM FRONT.（スワフロ）",
    "description": "異形の敵「ANOMALY」の大群に挑む「生存」と、多彩なステージを攻略する「進撃」を、ソロでも最大4人協力でも楽しめる3Dアクションシューティング。",
    "genre": "3Dアクション／サバイバル／協力シューティング",
    "playUrl": "https://swarm-front.melosalife-24.workers.dev/front",
    "playAccessNote": "無料（2026年10月10日時点）",
    "sourceNote": "ゲーム内容・操作・制作情報は作者提供の紹介をもとに編集しています。作者の端末確認と編集側の確認は下記で区別しています。編集側のクラウドChromeでURLへの到達を確認しましたが、WebGLが無効なため描画・操作は未確認です。紹介画像はゲーム本体の地形・モデル・描画を使い、紹介用に配置とカメラを調整して撮影し、正式タイトルロゴを重ねたものです。",
    "image": {
      "src": "/images/games/swarm-front/screen.jpeg",
      "alt": "市街地で、兵士たちがHARROWを含むANOMALYの大群に立ち向かう紹介用の場面。ゲーム本体の地形・モデル・描画を使い、配置とカメラを調整して撮影し、正式タイトルロゴを重ねています。",
      "width": 1600,
      "height": 900,
      "credit": "メロソ／SWARM FRONT.（作者表記案。追加クレジットは未確認）"
    },
    "deviceNote": "作者の動作確認：WindowsのCodex内ブラウザ、Android（OPPO Find X8）",
    "platformNote": "PCブラウザ、スマートフォンの横画面を想定しています。",
    "verifiedDevices": [
      "作者の確認記録：WindowsのCodex内ブラウザ、横画面1600×900。確認日は記載なし。",
      "作者の確認記録：Android端末（OPPO Find X8）。ブラウザ・画面向き・確認日は記載なし。",
      "編集確認：編集側のクラウドChromeでURLへの到達を確認（2026年10月14日）。ブラウザでWebGLが無効のため描画・操作・全編プレイは未確認。ゲームの不具合とは判定していません。"
    ],
    "about": "「生存」では、押し寄せるANOMALYの大群と戦いながら、3択強化と融合を組み合わせて、自分だけの戦い方を育てます。「進撃」では、装備と立ち回りを工夫し、多彩なステージでさまざまなANOMALYや巨大な敵に挑みます。どちらもソロと最大4人の協力プレイに対応し、銃撃・回避・仲間との連携で戦うブラウザゲームです。",
    "highlights": [
      "「生存」：3択強化と融合を組み合わせ、大群を相手に生き抜く",
      "「進撃」：装備と立ち回りを工夫し、多彩なステージとANOMALYを攻略する",
      "ソロでも最大4人協力でも楽しめる、迫力ある3D戦闘と援護・蘇生の連携"
    ],
    "howToPlay": [
      "URLを開き、遊びたいモードとソロ／協力プレイを選び、画面の案内に沿って装備や出撃準備を整えます。",
      "協力プレイでは部屋を作り、招待リンクを仲間に共有して参加してもらいます。"
    ],
    "controls": "スマホ：左スティックで移動、右側のドラッグで視点操作。画面内のボタンで射撃・装填・武器切替・回避などを行います。PC：WASDで移動、マウスで照準、左クリックで射撃。Rで装填、Qで武器切替、Spaceで回避、Fでジャンプ、E長押しで仲間を蘇生。",
    "pricingAndRegistration": "作者の案内では無料（2026年10月10日時点）。ソロはアカウント登録不要で、進行は使用した端末のブラウザ内に保存されます。協力プレイの登録条件は未確認です。",
    "author": {
      "name": "メロソ",
      "socialUrl": "https://x.com/futsalOORer",
      "socialLabel": "X @futsalOORer"
    },
    "aiRoles": [
      {
        "name": "Codex",
        "role": "プログラムの実装・修正・検証支援、Blenderを操作しての3Dモデル制作。"
      },
      {
        "name": "Claude Code",
        "role": "ゲームの動きなどの実装・修正支援。"
      },
      {
        "name": "ChatGPT",
        "role": "ゲームの企画・仕様の相談、画像制作・調整支援。"
      },
      {
        "name": "Geminiの音声生成",
        "role": "兵士のゲーム内ボイス制作。"
      },
      {
        "name": "Charakuru",
        "role": "3Dモデルのテクスチャ制作。"
      }
    ],
    "humanContribution": "ゲームの企画と仕様を決め、操作感、戦闘のテンポ、生存での強化・融合、進撃での装備やステージ攻略を確認しながら調整しています。兵士や敵の形・動き、画面演出、音声の方向性を比較し、採用するものと修正する点を判断しています。",
    "updatedAt": "2026-10-14",
    "sources": [
      {
        "label": "作者が公開しているゲーム",
        "href": "https://swarm-front.melosalife-24.workers.dev/front"
      }
    ]
  },
  {
    "slug": "monhero",
    "publicationStatus": "published",
    "order": 10,
    "publicationReview": {
      "urlChecked": true,
      "imageChecked": true,
      "permissionConfirmed": true,
      "approved": true
    },
    "title": "モンスターヒーロー（モンヒロ）",
    "description": "モンスターを育てて絆を深め、技とカードで敵のWAVEを勝ち抜くカードバトルに、親指2本で遊ぶ音ゲーも入ったスマホ向けブラウザゲーム。",
    "genre": "カードバトル／育成／リズムゲーム",
    "playUrl": "https://aknkakykhk-maker.github.io/monhero/",
    "playAccessNote": "無料・課金なし",
    "sourceNote": "ゲーム内容・操作・制作情報は作者提供の紹介をもとに編集しています。作者によるiPhone・Safariの縦横画面での動作確認と、編集側の確認は下記で区別しています。編集側のクラウドChromeでは現行版の読込・タイトル・助手選択画面の表示まで確認しました（未選択）。名前入力・ランキング送信・プレイは行っていません。",
    "image": {
      "src": "/images/games/monhero/screen.jpeg",
      "alt": "ハロウィーン調の城を背景に、青い翼のあるモンスター、魔女帽子のピンクのモンスター、一つ目のモンスター、金色と黒のドラゴンが並ぶモンスターヒーローのタイトル画面。",
      "width": 1882,
      "height": 870,
      "credit": "ゲーム画面の撮影：あつ／ゲーム内イラスト：ChatGPTで生成"
    },
    "deviceNote": "作者の動作確認：iPhone・Safari（縦／横）",
    "platformNote": "スマートフォンのブラウザを想定しています。バトルは縦画面、モンヒロビートは横画面が基本（縦でも遊べます）。ホーム画面に追加して、アプリのようにも遊べます。",
    "verifiedDevices": [
      "作者の確認記録：iPhone／Safari／縦と横／2026年10月13日。",
      "編集確認：編集側のクラウドChromeで現行版の読込・タイトル・助手選択画面の表示まで確認（未選択、2026年10月14日）。名前入力・ランキング送信・プレイは未実施。"
    ],
    "about": "モンスターを連れて、技・ガード・カードを組み合わせて敵のWAVEを勝ち抜くカードバトルです。勝つほど絆Lvが上がり、強化・合体・染色で自分だけの一体に育ちます。音ゲーモード「モンヒロビート」もあり、最上位のHELLでは地上の上の「空中」の段も叩きます。",
    "highlights": [
      "一体ずつ育つモンスター：固有技を持ち、強化・合体・染色で自分だけの一体になる",
      "段階的に上がる難易度：上に行くほど、その難易度だけの特殊ルールが加わる。周回を速くするクイックモードもある",
      "音ゲー「モンヒロビート」：スマホ横持ち・親指2本向け。地上と空中を行き来するHELLもある"
    ],
    "howToPlay": [
      "URLを開きます。",
      "「TAP TO START」を押します。",
      "助手の案内を聞きます。",
      "「名前を決める！」でプレイヤーネームとアイコンを決めます。",
      "ホームから「モンヒロバトル」か「モンヒロビート」を選びます。"
    ],
    "controls": "タッチ操作。バトル：タップでカードと技を選ぶ。モンヒロビート：タップ・長押し・スライド・フリック。",
    "pricingAndRegistration": "作者の案内では無料・課金なし（ゲーム内通貨のみ）。アカウント登録は不要。記録は端末ごとに保存され、ランキング用にプレイヤーネームだけ入力します。",
    "author": {
      "name": "あつ",
      "socialUrl": "https://x.com/alsto_07",
      "socialLabel": "X @alsto_07"
    },
    "aiRoles": [
      {
        "name": "Claude（Claude Code）",
        "role": "ゲームのプログラム、音ゲーの譜面づくり、自動の検査、更新履歴とヘルプの下書き。作業はバトル・音ゲー・修理などの「部署」に分けて任せています。"
      },
      {
        "name": "ChatGPT",
        "role": "モンスターやキャラクターの画像生成。"
      }
    ],
    "humanContribution": "企画と仕様を決め、実機で遊んで難しさや見え方を判断しています。音ゲーのHELLの難易度を、遊んだ体感で決め直しました。「押さえている最中に同じ位置へノーツを出さない」など、譜面の決まりを実際に押せなかった所から決めています。公開するかどうかも毎回判断しています。",
    "updatedAt": "2026-10-14",
    "sources": [
      {
        "label": "作者が公開しているゲーム",
        "href": "https://aknkakykhk-maker.github.io/monhero/"
      }
    ]
  }
];
