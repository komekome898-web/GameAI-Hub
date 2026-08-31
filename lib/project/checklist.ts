import type { BuildChecklistStep, PlanPhase, ProjectPlan } from './types';

const phaseFor=(plan:ProjectPlan,id:string)=>plan.phases.find(phase=>phase.id===id);
const projectContext=(plan:ProjectPlan)=>`ゲーム条件: genre=${plan.brief.genre}, dimension=${plan.brief.dimension}, platform=${plan.brief.platform}, engine=${plan.brief.engine}, experience=${plan.brief.experience}, team=${plan.brief.team}\n最小プレイ範囲: ${plan.verticalSlice.map(item=>item.title).join(' / ')}`;
const guidance:Record<string,{usage:string[];request:string}>={
  concept:{usage:['確認済みのゲーム条件と固有情報を開く','最小ループ、今回は作らない範囲、観察できる完了条件を1ページに固定する','第三者が同じ開始・成功・失敗・再試行を説明できるか確認する'],request:'最小ループ、対象範囲、対象外、開始・成功・失敗・再試行、観察可能な完了条件を1ページの企画書として出力する'},
  environment:{usage:['選択したゲームエンジンの公式導入手順を開く','空プロジェクトを作り、対象プラットフォームの起動設定を記録する','対象端末または実行環境で起動し、エンジン版と結果をREADMEへ残す'],request:'公式手順の確認項目、空プロジェクトの起動手順、READMEへ残す環境情報をチェックリストで出力する'},
  repository:{usage:['プロジェクトフォルダでGitを初期化するか、同等の復元可能なバックアップ先を開く','エンジン生成物と秘密情報を除外し、READMEへ起動手順を記入する','空プロジェクトを保存してから復元できることを確認する'],request:'除外候補、README項目、最初の保存と復元確認をファイル単位で出力する'},
  'core-loop':{usage:['コード支援ツールで対象リポジトリを開く','下のプロンプトと変更対象の最小ファイルだけを渡し、変更ファイル一覧とテストを要求する','差分をレビューしてゲームエンジンへ組み込み、対象環境でコアループとテストを実行する'],request:'変更ファイル一覧、最小実装、実行するテスト、対象環境での確認手順を出力する'},
  save:{usage:['コード支援ツールで保存状態を扱うファイルを開く','下のプロンプトと保存対象・初期値を渡し、保存・読込・破損時処理の差分とテストを要求する','差分を組み込み、終了・再起動・初期化を対象環境で確認する'],request:'保存データ項目、変更ファイル、保存・読込・初期化テスト、破損時の確認手順を出力する'},
  'ui-prototype':{usage:['コード支援ツールで画面と状態遷移のファイルを開く','開始・プレイ・結果の状態と入力方法を貼り、仮素材だけのUI差分を要求する','ゲームへ組み込み、キーボードまたはタッチと文字・形による状態判別を対象画面で確認する'],request:'画面状態表、変更ファイル、入力とフィードバック実装、対象画面での確認手順を出力する'},
  'required-assets':{usage:['プロジェクトの素材台帳を開く','縦切り範囲から必要な素材ID・用途・寸法やスケールの未確認欄を記入する','素材フォルダへ台帳を保存し、出典・生成条件・利用条件の記録欄を確認する'],request:'縦切りに限定した素材ID台帳、用途、仕様の未確認欄、出典と権利条件の確認欄を出力する'},
  'assets-2d':{usage:['推薦された2D画像ツールの制作画面と公式出力仕様を開く','下のプロンプトへ用途、必要サイズ、透過要否、画角、スタイル制約を記入して代表画像1点を作る','公式に対応する形式で出力し素材フォルダへ組み込み、サイズ・透過・可読性・利用条件をゲーム内で確認する'],request:'代表2D素材1点の用途、サイズ、透過、画角、避ける表現、出力・インポート・ゲーム内確認表を出力する'},
  'assets-3d':{usage:['推薦された3Dツールの制作画面と公式出力仕様を開く','用途、対象エンジン、スケール、必要なトポロジー・UV・rig・collisionの未確認条件を渡して代表モデル1点を作る','ツールとエンジン双方が公式対応する形式を確認して組み込み、スケール・材質・UV・collision・性能を実機確認する'],request:'代表3Dモデル1点の用途、スケール、トポロジー、UV、rig、collision、対応形式の確認、インポート検品表を出力する'},
  animation:{usage:['代表モデルとアニメーション工程の作業場所を開く','開始姿勢・終了姿勢・動作1件・時間の未確認値を仕様として入力する','clipをゲームへ組み込み、遷移・root motion・当たり判定タイミング・実機性能を確認する'],request:'代表animation clip 1件の開始/終了姿勢、遷移、root motion、当たり判定、出力と実機検品表を出力する'},
  voice:{usage:['推薦された音声ツールの制作画面と公式の権利・出力条件を開く','話者同意を確認し、台詞ID、読み、感情を付けた代表台詞3件を入力する','対応形式で出力し台詞IDでゲームへ組み込み、発音・音量・再生タイミング・同意記録を確認する'],request:'代表台詞3件の台詞ID、読み、感情、話者同意、出力形式確認、インポート後の発音と音量の検品表を出力する'},
  music:{usage:['推薦された音楽ツールの制作画面と公式の権利・出力条件を開く','場面の目的、雰囲気、loop要否、長さの未確認値を含むcue briefを入力して代表曲1件を作る','対応形式でゲームへ組み込み、loop点・音量・場面適合・生成条件と利用条件を確認する'],request:'代表BGM 1件のcue sheet、目的、雰囲気、loopと長さの確認欄、出力・組み込み・音量検品表を出力する'},
  sfx:{usage:['ゲーム内イベントIDの台帳と音声編集環境を開く','操作・UI・環境の代表イベントごとにtransientとtailを確認して効果音を作る','音声フォルダへ組み込みイベントIDへ割り当て、タイミング・音量・clipping・利用条件を実機確認する'],request:'代表SFXのイベントID、用途、transient/tail、ファイル割当、タイミング・音量・clipping・権利確認表を出力する'},
  'npc-dialogue':{usage:['推薦された会話ツールの設定画面と公式連携資料を開く','NPCの役割、許可範囲、禁止応答、fallbackを入力し固定10ターンのテストを実行する','fallback付きでゲームへ組み込み、遅延・失敗・禁止応答・利用量を記録する'],request:'NPC境界、禁止応答、fallback、固定10ターン試験、組み込み後の遅延と失敗記録表を出力する'},
  localization:{usage:['文字列ID、原文、文脈、文字数上限の表を開く','代表文字列を対象言語へ翻訳し、人が文脈と固有名詞をレビューする','IDを変えずゲームへ取り込み、UI収まり・font・言語切替・保存状態を対象端末で確認する'],request:'文字列ID、原文、文脈、文字数上限、訳文、要レビューflag、UI収まり確認を表形式で出力する'},
  qa:{usage:['対象ビルドとQA記録を開く','開始から終了、保存、入力、代表画面、失敗経路を順番に実行する','不具合ごとに再現手順、期待結果、実結果、対象環境を記録して再テストする'],request:'縦切りの実行順、代表ケース、失敗経路、再現手順・期待結果・実結果のQA表を出力する'},
  'store-assets':{usage:['公開先の最新公式要件と実機ビルドを開く','公開しない場合は対象外を記録し、公開する場合は実装済み内容だけで説明と画像を作る','権利、privacy、年齢区分の未確認事項と公式確認先を公開台帳へ残す'],request:'公開しない判断欄、実装済み内容だけの説明・画像一覧、権利・privacy・年齢区分の公式確認表を出力する'},
  release:{usage:['クリーンなビルド環境と対象端末を開く','公開しない場合は対象外を記録し、公開する場合は候補ビルドを作成する','インストールから終了まで確認し、既知の制約、戻し方、公式公開要件の確認結果を残す'],request:'候補ビルド手順、対象端末試験、既知の制約、rollback、公式公開要件の最終確認表を出力する'},
};

function step(plan:ProjectPlan,id:string,title:string,outcome:string,why:string,phase:PlanPhase|undefined,substeps:string[],doneWhen:string[],forceManual=false):BuildChecklistStep {
  const tools=forceManual?[]:phase?.tools??[];
  const guide=guidance[id];
  // Review-only candidates remain visible as research leads, but must never
  // become the adopted tool in generated instructions or prompts.
  const primary=tools.find(tool=>tool.role==='primary')??tools.find(tool=>tool.role==='alternative');
  const usageInstructions=guide.usage.map((instruction,index)=>index===0&&primary?`${primary.name}: ${instruction.replace('推薦された','')}`:instruction);
  return {id,title,outcome,why,substeps,tools,usageInstructions,prompt:`あなたはゲーム制作アシスタントです。次の一工程だけを支援してください。\n${projectContext(plan)}\n工程: ${title}\n成果物: ${outcome}\n${primary?`使用候補: ${primary.name}\n`:''}依頼: ${guide.request}\n未確認の価格、権利、形式、寸法、期間を推測せず「要確認」と明記してください。`,doneWhen};
}

/** Produces an ordered, affiliate-neutral build queue from the generated plan. */
export function buildChecklist(plan:ProjectPlan):BuildChecklistStep[] {
  const concept=phaseFor(plan,'concept'), code=phaseFor(plan,'code')??phaseFor(plan,'prototype'), integration=phaseFor(plan,'integration');
  const items:BuildChecklistStep[]=[
    step(plan,'concept','最小ループを1ページに固定する','コアループと対象外を説明できる1ページ企画書がある','実装や素材制作の前に、何を遊べれば成立するかを固定するため。',concept,['最小の操作連鎖を書く','今回は作らない機能を列挙する','成功・失敗・再試行の観察条件を決める'],concept?.doneWhen??['コアループを1文で説明できる','完成範囲と対象外を列挙している'],true),
    step(plan,'environment','制作環境を起動する','空のプロジェクトが対象環境で起動する','以降の不具合を環境の問題として切り分けるため。',undefined,['公式導入手順を確認する','空プロジェクトを作る','対象環境で起動し版を記録する'],['空プロジェクトが対象環境で起動する','エンジンと対象環境をREADMEへ記録している'],true),
    step(plan,'repository','変更を戻せる状態にする','最初の復元可能なスナップショットがある','AIによる変更を確認し、失敗から戻れるようにするため。',undefined,['Gitまたはバックアップ先を用意する','生成物と秘密情報を除外する','起動手順と最初の状態を保存する'],['起動手順が別の作業者にも読める','最初の状態へ戻す方法を確認している'],true),
    step(plan,'core-loop','コアループを通す',plan.verticalSlice[0]?.title??'最小のゲームループが動く','面白さと最大の技術リスクを先に検証するため。',code,plan.today,[...(plan.verticalSlice[0]?.doneWhen??[]),...(plan.brief.genre==='monster-collection'?(plan.verticalSlice.find(item=>item.id==='first-set')?.doneWhen??[]):[])].filter((value,index,array)=>array.indexOf(value)===index)),
    step(plan,'save','セーブと復帰を通す','終了後も最小の進行状態を復元できる','データ構造の手戻りを早く見つけるため。',integration,['保存する最小状態を決める','保存・読込・初期化を実装する','再起動と破損時を確認する'],['終了後に代表的な進行状態を復元できる','初期化と読込失敗時を確認している']),
    step(plan,'ui-prototype','操作UIを仮実装する','開始から結果まで主要入力で進める','見た目の量産前に状態遷移の欠落を見つけるため。',integration,['開始・プレイ・結果をつなぐ','入力とfeedbackを表示する','代表画面を実機確認する'],['開始から結果まで主要入力で進める','状態が色だけでなく文字または形でも判別できる']),
    step(plan,'required-assets','必要素材を台帳化する','縦切り範囲の素材IDと検証欄がある','大量生成前に必要量と権利確認を限定するため。',concept,['必要な素材IDだけを列挙する','用途と未確認仕様を書く','出典・生成条件・利用条件欄を作る'],['縦切りの素材IDと用途が揃う','出典と利用条件の確認欄がある'],true),
  ];
  const optional=(id:string,title:string,outcome:string,why:string,phaseId:string,substeps:string[])=>{const phase=phaseFor(plan,phaseId);if(phase)items.push(step(plan,id,title,outcome,why,phase,substeps,phase.doneWhen));};
  if(plan.brief.capabilities.includes('art-2d')){const phase=phaseFor(plan,'visuals');items.push(step(plan,'assets-2d','代表2D素材を組み込む','2D素材1点がゲーム内で正しく表示される','透過・サイズ・可読性を量産前に確認するため。',phase,['代表画像1点の仕様を書く','ツールで生成・出力する','ゲームへimportして実機検品する'],['代表素材をゲームへimportして対象画面で表示できる','サイズ・透過・可読性を実機で確認している','出典・生成条件・利用条件を記録している']));}
  if(plan.brief.capabilities.includes('assets-3d')||plan.brief.dimension==='3d')optional('assets-3d','代表3D素材を組み込む','3Dモデル1点が対象環境で表示される','形式・スケール・材質・性能を量産前に確認するため。','3d',['代表モデル1点の仕様を書く','対応形式を公式確認して生成・出力する','importしてscale・UV・collision・性能を確認する']);
  if(plan.brief.capabilities.includes('animation'))optional('animation','代表animationを組み込む','代表動作1件がゲーム内で再生される','遷移と当たり判定を量産前に確認するため。','animation',['代表動作1件を定義する','clipを作成・出力する','遷移・root motion・timingを実機確認する']);
  if(plan.brief.capabilities.includes('voice')){const phase=phaseFor(plan,'voice');items.push(step(plan,'voice','代表台詞を組み込む','台詞ID付き音声がゲーム内で再生される','同意・発音・音量を量産前に確認するため。',phase,['話者同意と台詞IDを確認する','代表台詞3件を生成・出力する','IDで組み込み発音・音量を確認する'],['代表台詞へ台詞IDを割り当てゲーム内で再生できる','発音・音量・再生タイミングを実機で確認している','話者同意と利用条件を記録している']));}
  if(plan.brief.capabilities.includes('music'))optional('music','代表BGMを組み込む','場面用BGM 1件がゲーム内で再生される','loop・音量・場面適合を量産前に確認するため。','music-sfx',['cue briefを書く','代表曲1件を生成・出力する','組み込みloop・音量を確認する']);
  if(plan.brief.capabilities.includes('sfx'))items.push(step(plan,'sfx','代表SFXを組み込む','イベントID付き効果音がゲーム内で再生される','timingと音量を量産前に確認するため。',undefined,['イベントIDを列挙する','代表SFXを作成する','IDへ割当て実機確認する'],['代表イベントで正しいタイミングに再生される','音量・clipping・利用条件を確認している'],true));
  if(plan.brief.capabilities.includes('npc-dialogue')){const phase=phaseFor(plan,'npc-dialogue');items.push(step(plan,'npc-dialogue','代表NPC会話を検証する','境界とfallback付き会話経路が動く','禁止応答と失敗経路を統合前に確認するため。',phase,['NPC境界と禁止応答を書く','固定10ターンを試験する','fallback付きで組み込み記録する'],phase?.doneWhen??['固定会話試験とfallbackを記録している'],!phase));}
  if(plan.brief.capabilities.includes('localization'))optional('localization','代表文字列をローカライズする','IDを保った対象言語UIが動く','文脈欠落とUI崩れを量産前に確認するため。','localization',['文字列ID表を作る','代表文字列を翻訳・reviewする','importしてUI・font・切替を確認する']);
  const testing=phaseFor(plan,'testing'), publishing=phaseFor(plan,'publishing');
  items.push(step(plan,'qa','縦切りをQAする','代表操作と失敗経路の確認記録がある','公開準備前に不具合と未確認事項を分離するため。',testing,['開始から終了まで操作する','保存・入力・画面を確認する','再現手順と期待結果を書く'],testing?.doneWhen??['代表経路の確認記録がある']),step(plan,'store-assets','公開する場合の素材を用意する','説明・画像または公開対象外の判断がある','未実装機能を宣伝しないため。',publishing,['公開有無を記録する','公式要件を確認する','実装済み内容だけで素材を作る'],['公開判断と説明・画像を記録している','権利等の未確認事項が明示される']),step(plan,'release','公開する場合の候補を検証する','候補buildまたは公開対象外の判断がある','開発環境だけで動く状態を公開しないため。',publishing,['公開有無を記録する','clean環境でbuildする','対象端末とrollbackを確認する'],['公開判断または確認済みbuildがある','制約と戻し方を記録している']));
  return items;
}
