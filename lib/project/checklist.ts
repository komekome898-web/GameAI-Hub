import type { BuildChecklistStep, PlanPhase, ProjectPlan } from './types';

const phaseFor=(plan:ProjectPlan,...ids:string[])=>plan.phases.find(phase=>ids.includes(phase.id));
const actionPrompt=(plan:ProjectPlan,instruction:string)=>`あなたはゲーム制作アシスタントです。次の一工程だけを支援してください。\n\n工程: ${instruction}\nゲーム条件: genre=${plan.brief.genre}, dimension=${plan.brief.dimension}, platform=${plan.brief.platform}, engine=${plan.brief.engine}, experience=${plan.brief.experience}, team=${plan.brief.team}\n最小プレイ範囲: ${plan.verticalSlice.map(item=>item.title).join(' / ')}\n\n推測で機能・価格・権利条件を補わないでください。変更対象、実行手順、確認方法、完了チェックを順番に提示してください。`;
const combinedPhase=(plan:ProjectPlan,...ids:string[]):PlanPhase|undefined=>{
  const phases=plan.phases.filter(phase=>ids.includes(phase.id));
  if(!phases.length)return undefined;
  return {...phases[0],tools:phases.flatMap(phase=>phase.tools),doneWhen:phases.flatMap(phase=>phase.doneWhen),manualWork:phases.flatMap(phase=>phase.manualWork)};
};

function step(plan:ProjectPlan,id:string,title:string,outcome:string,why:string,phase:PlanPhase|undefined,substeps:string[],doneWhen:string[]):BuildChecklistStep {
  const tools=phase?.tools??[];
  const primary=tools.find(tool=>tool.role==='primary')??tools[0];
  return {
    id,title,outcome,why,substeps,tools,
    usageInstructions:primary
      ? [`${primary.name}の公式情報を確認し、下のプロンプトを工程の仕様として使う`,`出力をそのまま採用せず、成果物を対象環境で人が確認する`,...(primary.manualChecks.length?primary.manualChecks.slice(0,2):['利用条件と出力の権利条件を公式情報で確認する'])]
      : ['下のプロンプトを実装メモとして使い、対象ファイルを一つずつ変更する','変更ごとに対象環境で確認し、結果を記録する'],
    prompt:actionPrompt(plan,`${title}。成果: ${outcome}。作業: ${substeps.join(' → ')}`),
    doneWhen,
  };
}

/** Produces an ordered, affiliate-neutral build queue from the generated plan. */
export function buildChecklist(plan:ProjectPlan):BuildChecklistStep[] {
  const concept=phaseFor(plan,'concept'), code=phaseFor(plan,'code','prototype'), integration=phaseFor(plan,'integration');
  const visuals=combinedPhase(plan,'visuals','3d','animation'), audio=combinedPhase(plan,'music-sfx','voice'), dialogue=combinedPhase(plan,'npc-dialogue','localization'), testing=phaseFor(plan,'testing'), publishing=phaseFor(plan,'publishing');
  const items=[
    step(plan,'environment','制作環境を起動する','空のプロジェクトが対象環境で起動する','以降の不具合を企画ではなく環境の問題として切り分けるため。',concept,['選んだゲームエンジンを用意する','空のプロジェクトを作る','対象プラットフォーム向けに一度起動する'],['空プロジェクトが対象環境で起動する','エンジンと対象環境をREADMEへ記録している']),
    step(plan,'repository','変更を戻せる状態にする','最初の復元可能なスナップショットがある','AIによる変更を小さな差分で確認し、失敗から戻れるようにするため。',concept,['Gitを使える場合は生成物と秘密情報を除外する','READMEに起動手順を書く','Gitまたはバックアップで空プロジェクトを保存する'],['起動手順が別の作業者にも読める','最初の状態へ戻す方法を確認している']),
    step(plan,'core-loop','コアループを通す',plan.verticalSlice[0]?.title??'最小のゲームループが動く','面白さと技術上の最大リスクを、コンテンツ量産より先に検証するため。',code,plan.today,code?.doneWhen??[`${plan.verticalSlice[0]?.title??'最小ループ'}を操作して確認できる`]),
    step(plan,'save','セーブと復帰を通す','終了後も最小の進行状態を復元できる','後からデータ構造を作り直すリスクを早く見つけるため。',integration,['保存する最小状態を決める','保存・読込・初期化を実装する','破損または旧データ時の挙動を確認する'],['終了後に代表的な進行状態を復元できる','初期化と読込失敗時の挙動を確認している']),
    step(plan,'ui-prototype','操作UIを仮実装する','開始から結果まで迷わず操作できる','見た目の作り込み前に操作と状態遷移の欠落を見つけるため。',integration,['開始・プレイ・結果の画面をつなぐ','入力方法とフィードバックを表示する','代表画面を実機サイズで確認する'],['開始から結果まで主要入力だけで進める','成功・失敗・再試行の状態が文字または形でも判別できる']),
    step(plan,'required-assets','必要素材だけを作る','縦切り範囲に必要な素材がゲーム内で表示される','未検証のゲームへ大量の素材を作る手戻りを避けるため。',visuals,['素材一覧から縦切りに必要なものだけ選ぶ','2D・3D・アニメーションの該当工程をそれぞれ試作する','出典・生成条件・利用条件を記録して組み込む'],visuals?.doneWhen??['必要な代表素材がゲーム内で表示される','素材ごとの出典と利用条件を記録している']),
  ];
  if(audio) items.push(step(plan,'audio','必要な音声・音を組み込む','必要な音が実機で再生される','ゲーム状態のフィードバックと雰囲気を実機で検証するため。',audio,['必要なBGM・効果音・音声を工程別に列挙する','各工程を試作して利用条件を記録する','音量、ループ、再生タイミングを実機確認する'],audio.doneWhen));
  if(dialogue) items.push(step(plan,'dialogue-localization','会話・言語工程を通す','要求された会話と対象言語が同じ状態で動く','会話状態と翻訳文脈の欠落を量産前に発見するため。',dialogue,['会話IDと文字列IDを固定する','NPC会話と対象言語の代表経路を実装する','文脈、UI収まり、状態復元を人が確認する'],dialogue.doneWhen));
  items.push(
    step(plan,'qa','縦切りをQAする','代表操作と失敗経路の確認記録がある','公開準備の前に再現できる不具合と未確認事項を分離するため。',testing,['開始から終了まで通して操作する','保存、入力、画面サイズの代表ケースを確認する','不具合に再現手順と期待結果を書く'],testing?.doneWhen??['代表経路と失敗経路の確認記録がある']),
    step(plan,'store-assets','公開する場合の素材を用意する','実際のゲーム内容と一致する説明・画像が揃う','未実装機能を宣伝せず、公開審査の手戻りを減らすため。',publishing,['公開予定がなければ「対象外」と記録する','公開先の最新要件を公式情報で確認する','実機画面と実装済み内容だけで素材を作る'],['公開しない判断、または公開先用の説明と画像を記録している','権利・プライバシー・年齢区分の未確認事項が明示されている']),
    step(plan,'release','公開する場合の候補を検証する','配布可能なビルドと検証記録がある','開発環境だけで動く状態を公開しないため。',publishing,['公開予定がなければ「対象外」と記録する','公開する場合はクリーン環境でビルドする','対象端末で確認し既知の制約を記録する'],['公開しない判断、または対象端末で確認済みの候補ビルドがある','既知の制約と戻し方を記録している']),
  );
  return items;
}
