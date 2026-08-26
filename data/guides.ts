import { z } from 'zod';

const guideSchema=z.object({
  slug:z.string().regex(/^[a-z0-9-]+$/), title:z.string().min(1), description:z.string().min(1), queryFamily:z.string().min(1), lastVerified:z.iso.date(),
  audience:z.string().min(1), outcome:z.string().min(1),
  steps:z.array(z.object({title:z.string().min(1),objective:z.string().min(1),deliverables:z.array(z.string().min(1)).min(1),doneWhen:z.array(z.string().min(1)).min(1),pitfall:z.string().min(1)})).min(3),
  checks:z.array(z.string().min(1)).min(1),
  sources:z.array(z.object({label:z.string().min(1),url:z.url()})).min(1),
});
export type Guide=z.infer<typeof guideSchema>;
export const guides=guideSchema.array().parse([
  {
    slug:'ai-2d-rpg-workflow',title:'AIで2D RPGを作る：最初のVertical Slice実践手順',description:'大作の素材生成から始めず、1マップ・1戦闘・セーブ確認までを小さく完成させるAI支援ワークフロー。',queryFamily:'AIで2D RPGを作る',lastVerified:'2026-08-26',audience:'一人または小規模チームで、2D RPGの最初の遊べる版を作る人',outcome:'1つの小さなマップで、移動・会話・戦闘・報酬・セーブ／ロードを通して確認できる状態',
    steps:[
      {title:'1. コアループと「作らないもの」を固定する',objective:'素材数ではなく、プレイヤーが繰り返す操作を先に決めます。',deliverables:['1ページの企画メモ','移動→会話または戦闘→報酬、という最小ループ','ワールドマップ、クラフト、大量の敵など初回対象外の一覧'],doneWhen:['初回版に含める操作を第三者が説明できる','追加案を対象外一覧へ戻せる'],pitfall:'AIにゲーム全体を一度に依頼すると、仕様と検証点が曖昧になります。'},
      {title:'2. プレースホルダーで1マップを実装する',objective:'絵の品質より先に、選んだエンジンで操作と画面遷移を検証します。',deliverables:['開始地点と出口を持つ小さなマップ','プレイヤー移動と1つのインタラクション','仮画像・仮音声の出所台帳'],doneWhen:['新規開始からマップの終了条件まで操作できる','不足素材が仮素材として明示されている'],pitfall:'生成画像を先に量産すると、必要な向き・サイズ・状態が後から変わります。'},
      {title:'3. 1戦闘とデータ境界を作る',objective:'敵やアイテムをコードへ直書きせず、少数の代表データで拡張方法を検証します。',deliverables:['プレイヤー1体と敵1〜2体のデータ','開始・選択・解決・報酬までの戦闘','データ項目と保存対象のメモ'],doneWhen:['戦闘を最後まで完了できる','値をデータ側で変えて挙動を再確認できる'],pitfall:'AI生成コードは動作しても、保存形式や責務が混在している場合があります。レビューとテストを省略しません。'},
      {title:'4. セーブ／ロードと最初のビルドを通す',objective:'後回しにすると壊れやすい永続化と配布形式を、内容が少ない段階で確認します。',deliverables:['進行と最低限のプレイヤー状態の保存','ロード後の再開地点','対象プラットフォーム向けテストビルド'],doneWhen:['終了後に再起動して進行を復元できる','別環境またはクリーン状態でビルドを起動できる'],pitfall:'保存データの互換性方針を決めずに項目を増やすと、更新時の移行が難しくなります。'},
    ],checks:['生成コードを採用前にレビューし、対象エンジンの実機ビルドで確認する','生成素材ごとに入力素材、生成日、利用プラン、規約URLを記録する','商用公開前にストア要件と全素材の権利条件を再確認する'],
    sources:[{label:'Godot: Saving games',url:'https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html'},{label:'Unity: ScriptableObject',url:'https://docs.unity3d.com/Manual/class-ScriptableObject.html'}]
  },
  {
    slug:'codex-game-development-brief',title:'Codexでゲーム開発を始める：実装ブリーフの作り方',description:'ゲーム全体を丸投げせず、スコープ、非目標、成果物、テストを明示して最初の実装タスクへ分ける方法。',queryFamily:'Codexでゲーム開発',lastVerified:'2026-08-26',audience:'既存または新規のゲームプロジェクトで、Coding Agentへ安全に作業を渡したい開発者',outcome:'リポジトリを確認してから実行できる、小さく検証可能な最初のタスクと受け入れ条件',
    steps:[
      {title:'1. 実装前提をブリーフへ固定する',objective:'エンジン、対象プラットフォーム、コアループ、初回スコープを明示します。',deliverables:['確認済みのプロジェクト要約','初回マイルストーンと非目標','未決定事項と不足アセットの一覧'],doneWhen:['確認済み事実と未決定事項が区別されている','未確認のエンジン版やコマンドを推測していない'],pitfall:'短い「ゲームを作って」という依頼では、Agentが安全に決められない設計判断まで暗黙に委ねます。'},
      {title:'2. 最初のタスクを1つの検証単位にする',objective:'フォルダ一式ではなく、実行して成否を判断できる最小機能にします。',deliverables:['変更対象または探索対象','期待する1つのユーザーフロー','対象外の機能'],doneWhen:['タスク完了を操作または自動テストで判定できる','次のタスクと混ざっていない'],pitfall:'コード、最終アート、音声、公開設定を同時に依頼すると、失敗原因を切り分けにくくなります。'},
      {title:'3. リポジトリ固有の検証方法を書く',objective:'Agentが既存の規約とテストを読み、変更後に適切な確認を行えるようにします。',deliverables:['参照すべきAGENTS.mdやREADME','既存テスト・ビルドコマンド','実機で人が確認する項目'],doneWhen:['既存指示の確認が最初の作業に含まれる','成功したコマンドと未実施確認を区別して報告できる'],pitfall:'存在しないコマンドや一般的なエンジン構成をブリーフへ決め打ちしません。'},
      {title:'4. 不足素材には契約を与える',objective:'素材が未完成でも実装を止めず、後から差し替えられる境界を作ります。',deliverables:['仮素材のファイル名・寸法・形式','差し替え箇所','権利確認が必要な素材一覧'],doneWhen:['仮素材を明確に識別できる','最終素材への差し替えがロジック変更を要求しない'],pitfall:'出所不明のネット画像や音声を仮素材としてリポジトリへ追加しません。'},
    ],checks:['自由文のアイデアやプロンプトを分析イベントへ送らない','Agentの説明ではなく、差分・テスト結果・実機操作で完了を確認する','秘密情報、ストア資格情報、個人データをブリーフへ含めない'],
    sources:[{label:'OpenAI Codex overview',url:'https://developers.openai.com/codex/overview'},{label:'Codex AGENTS.md guide',url:'https://developers.openai.com/codex/guides/agents-md'}]
  }
]);
export function getGuide(slug:string){return guides.find(guide=>guide.slug===slug)}
