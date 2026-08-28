"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
import { OutboundLink } from "@/components/OutboundLink";
import { getService } from "@/lib/services";
import {
  decodeProjectState,
  encodeProjectState,
  buildChecklist,
  projectProgressKey,
  generateProjectPlan,
  interpretProjectIdea,
  projectCapabilities,
  type DetailCandidate,
  type PlanTool,
  type ProjectBrief,
  type ProjectPlan,
  type BuildChecklistStep,
  type ProviderInterpretation,
  InterpretationSchema,
} from "@/lib/project";

const examples = [
  "2Dのモンスター収集ゲーム。iPhone向け。一人開発。AIを最大限使いたい。月1万円以内。",
  "Steam向け3Dホラー。Unity。プログラミング中級。絵と音声はAIで作りたい。",
  "ビジュアルノベル。日本語と英語。音声あり。できるだけ低予算。",
];
const labels = {
  genre: {
    rpg: "RPG",
    "monster-collection": "モンスター収集",
    "visual-novel": "ビジュアルノベル",
    horror: "ホラー",
    action: "アクション",
    puzzle: "パズル",
    other: "その他",
    unknown: "未確認",
  },
  dimension: { "2d": "2D", "3d": "3D", unknown: "未確認" },
  platform: {
    web: "Web",
    mobile: "モバイル",
    desktop: "PC / Steam",
    "multi-platform": "複数",
    unknown: "未確認",
  },
  engine: {
    unity: "Unity",
    unreal: "Unreal Engine",
    godot: "Godot",
    other: "その他",
    undecided: "未定",
    unknown: "未確認",
  },
  budget: {
    free: "無料のみ",
    low: "低予算",
    flexible: "柔軟",
    unknown: "未確認",
  },
  experience: {
    beginner: "初心者",
    intermediate: "中級",
    advanced: "上級",
    unknown: "未確認",
  },
  team: {
    solo: "一人",
    "small-team": "小規模チーム",
    team: "チーム",
    unknown: "未確認",
  },
  commercialIntent: {
    personal: "非商用",
    commercial: "商用",
    undecided: "未定",
    unknown: "未確認",
  },
  locale: {
    ja: "日本語",
    "ja-en": "日本語・英語",
    multi: "多言語",
    unknown: "未確認",
  },
} as const;
const capabilityLabels: Record<(typeof projectCapabilities)[number], string> = {
  coding: "コーディング",
  "art-2d": "2Dアート",
  "assets-3d": "3D素材",
  animation: "アニメーション",
  voice: "音声",
  music: "BGM",
  sfx: "効果音",
  "npc-dialogue": "NPC・会話",
  localization: "ローカライズ",
  trailer: "動画・トレーラー",
};
type Field = Exclude<keyof ProjectBrief, "idea" | "capabilities" | "details">;
const fields: Field[] = [
  "genre",
  "dimension",
  "platform",
  "engine",
  "budget",
  "experience",
  "team",
  "commercialIntent",
  "locale",
];
const critical: Field[] = [
  "genre",
  "dimension",
  "platform",
  "budget",
  "experience",
  "team",
  "commercialIntent",
];

export function ProjectIdeaForm({
  location,
  onIdea,
}: {
  location: "home" | "project";
  onIdea?: (idea: string) => void;
}) {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [error, setError] = useState("");
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = idea.trim();
    if (!value) {
      setError("作りたいゲームを1文以上で入力してください。");
      return;
    }
    sessionStorage.setItem("gameai:project-idea", value);
    track("project_start", { page: location === "home" ? "/" : "/project" });
    if (onIdea) onIdea(value);
    else router.push("/project");
  };
  return (
    <form className="project-idea-card" onSubmit={submit}>
      <label htmlFor={`project-idea-${location}`}>
        <strong>どんなゲームを作りたいですか？</strong>
        <span>
          形式、公開先、経験、予算、必要な素材など、決まっていることだけを書いてください。
        </span>
      </label>
      <textarea
        id={`project-idea-${location}`}
        value={idea}
        onChange={(event) => {
          setIdea(event.target.value.slice(0, 1200));
          setError("");
        }}
        rows={7}
        maxLength={1200}
        aria-describedby={`idea-help-${location} ${error ? `idea-error-${location}` : ""}`}
        placeholder="例：Steam向け3Dホラー。Unity。プログラミング中級。絵と音声はAIで作りたい。"
      />
      <div id={`idea-help-${location}`} className="idea-meta">
        <span>{idea.length} / 1200</span>
        <span>入力文をアクセス解析へ送信しません</span>
      </div>
      {error && (
        <p id={`idea-error-${location}`} className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button" type="submit">
        制作ロードマップを作る
      </button>
      <fieldset className="idea-examples">
        <legend>入力例を使う</legend>
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setIdea(example);
              setError("");
            }}
          >
            {example}
          </button>
        ))}
      </fieldset>
    </form>
  );
}

function initialBrief(idea: string, parsed = interpretProjectIdea(idea)): {
  brief: ProjectBrief;
  evidence: Set<Field>;
  conflicts: string[];
  detailCandidates: DetailCandidate[];
} {
  const brief: ProjectBrief = {
    idea,
    genre: "unknown",
    dimension: "unknown",
    platform: "unknown",
    engine: "unknown",
    budget: "unknown",
    experience: "unknown",
    team: "unknown",
    commercialIntent: "unknown",
    capabilities: [],
    locale: "unknown",
    details: [],
  };
  const evidence = new Set<Field>();
  for (const item of parsed.fields) {
    if (item.field === "capabilities")
      brief.capabilities = item.value as ProjectBrief["capabilities"];
    else if (item.field !== "idea" && item.field !== "details") {
      (brief as unknown as Record<string, string>)[item.field] =
        item.value as string;
      evidence.add(item.field as Field);
    }
  }
  return {
    brief,
    evidence,
    conflicts: parsed.conflicts,
    detailCandidates: parsed.detailCandidates,
  };
}

function isProviderInterpretation(value:unknown):value is ProviderInterpretation{
  if(!value||typeof value!=="object")return false;
  const item=value as Partial<ProviderInterpretation>;
  return Boolean(item.interpretation&&Array.isArray(item.interpretation.fields)&&Array.isArray(item.interpretation.detailCandidates)&&Array.isArray(item.interpretation.conflicts)&&item.status&&(item.status.mode==='provider'||item.status.mode==='deterministic')&&Array.isArray(item.confirmationRequired));
}

export function ProjectGeneratorClient() {
  const [brief, setBrief] = useState<ProjectBrief | null>(null);
  const [evidence, setEvidence] = useState<Set<Field>>(new Set());
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [detailCandidates, setDetailCandidates] = useState<DetailCandidate[]>(
    [],
  );
  const [detailDecisions, setDetailDecisions] = useState<
    Record<string, "include" | "ignore">
  >({});
  const [sharedDraft, setSharedDraft] = useState(false);
  const [plan, setPlan] = useState<ProjectPlan | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [interpretationStatus, setInterpretationStatus] = useState<ProviderInterpretation["status"] | null>(null);
  const [providerConfirmation, setProviderConfirmation] = useState<Set<string>>(new Set());
  const [interpreting, setInterpreting] = useState(false);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const shared = decodeProjectState(location.search);
    if (shared) {
      // URL/session state is browser input and is intentionally applied after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBrief(shared);
      setSharedDraft(true);
      if (!critical.some((field) => shared[field] === "unknown"))
        setPlan(generateProjectPlan(shared));
    } else {
      const idea = new URLSearchParams(location.search).get("idea")?.slice(0,1200) || sessionStorage.getItem("gameai:project-idea");
      if (idea) void beginInterpretation(idea);
    }
    setReady(true);
  }, []);
  async function beginInterpretation(idea:string) {
    setInterpreting(true); setError("");
    let outcome:ProviderInterpretation;
    try{
      const response=await fetch('/api/project/interpret',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idea})});
      if(!response.ok)throw new Error('interpretation request failed');
      const candidate:unknown=await response.json(); if(!isProviderInterpretation(candidate))throw new Error('invalid interpretation response');
      const parsed=InterpretationSchema.safeParse(candidate.interpretation); if(!parsed.success)throw new Error('invalid interpretation response'); outcome={...candidate,interpretation:parsed.data};
    }catch{
      outcome={interpretation:interpretProjectIdea(idea),status:{providerName:'ローカル判定',mode:'deterministic',fallbackReason:'provider_error'},confirmationRequired:[]};
    }
    const start=initialBrief(idea,outcome.interpretation);
    setBrief(start.brief); setEvidence(outcome.status.mode==='provider'?new Set():start.evidence);
    setConflicts(start.conflicts); setDetailCandidates(start.detailCandidates); setDetailDecisions({});
    setProviderConfirmation(new Set(outcome.confirmationRequired.filter(field=>fields.includes(field as Field)||field==='capabilities')));
    setInterpretationStatus(outcome.status); setInterpreting(false);
  }
  useEffect(() => {
    if (plan) resultHeading.current?.focus();
  }, [plan]);
  if (!ready)
    return (
      <p className="builder-loading" role="status">
        プロジェクト条件を読み込んでいます…
      </p>
    );
  if (!brief&&interpreting)return <p className="builder-loading" role="status">条件を安全に整理しています…</p>;
  if (!brief)
    return (
      <div className="project-start-page">
        <header className="builder-head">
          <p className="eyebrow">AI GAME PROJECT GENERATOR</p>
          <h1>
            ゲームのアイデアを
            <br />
            実行計画へ
          </h1>
          <p className="lead">
            決まっていないことを推測で埋めず、必要な条件だけ確認します。
          </p>
        </header>
        <ProjectIdeaForm
          location="project"
          onIdea={(idea) => { void beginInterpretation(idea); }}
        />
      </div>
    );
  if (plan)
    return (
      <ProjectResult
        plan={plan}
        headingRef={resultHeading}
        onEdit={() => setPlan(null)}
      />
    );
  const update = <K extends keyof ProjectBrief>(
    key: K,
    value: ProjectBrief[K],
  ) => setBrief((old) => (old ? { ...old, [key]: value } : old));
  const generate = () => {
    const missing = critical.filter((field) => brief[field] === "unknown");
    const pending = detailCandidates.filter(
      (item) => !detailDecisions[item.id],
    );
    const invalidDetail = brief.details.find((item) => !item.text.trim());
    if (missing.length || pending.length || invalidDetail || providerConfirmation.size) {
      setError(
        [
          missing.length
            ? `未確認の必須条件があります：${missing.map((field) => fieldLabel(field)).join("、")}`
            : "",
          pending.length
            ? `ゲーム固有情報を「計画に含める」または「今回は含めない」で確認してください（残り${pending.length}件）`
            : "",
          providerConfirmation.size ? `AIが抽出した候補を確認してください（残り${providerConfirmation.size}件）` : "",
          invalidDetail
            ? "計画に含めるゲーム固有情報を1文字以上入力してください"
            : "",
        ]
          .filter(Boolean)
          .join("。"),
      );
      track("project_clarify", {
        missing_count:
          missing.length + pending.length + providerConfirmation.size + (invalidDetail ? 1 : 0),
      });
      if (invalidDetail)
        document.getElementById(`project-detail-${invalidDetail.id}`)?.focus();
      return;
    }
    setError("");
    track("project_generate", {
      game_type: brief.dimension,
      budget: brief.budget,
    });
    setPlan(generateProjectPlan(brief));
    history.replaceState(null, "", `/project?${encodeProjectState(brief)}`);
  };
  const decideDetail = (
    candidate: DetailCandidate,
    decision: "include" | "ignore",
  ) => {
    setDetailDecisions((old) => ({ ...old, [candidate.id]: decision }));
    setBrief((old) =>
      old
        ? {
            ...old,
            details:
              decision === "include"
                ? [
                    ...old.details.filter((item) => item.id !== candidate.id),
                    candidate,
                  ]
                : old.details.filter((item) => item.id !== candidate.id),
          }
        : old,
    );
    setError("");
  };
  const editDetail = (candidate: DetailCandidate, text: string) => {
    const bounded = text.slice(0, 80);
    setDetailCandidates((old) =>
      old.map((item) =>
        item.id === candidate.id ? { ...item, text: bounded } : item,
      ),
    );
    setBrief((old) =>
      old
        ? {
            ...old,
            details: old.details.map((item) =>
              item.id === candidate.id
                ? { ...item, text: bounded, provenance: "confirmed" }
                : item,
            ),
          }
        : old,
    );
  };
  return (
    <div className="project-clarify">
      <header className="builder-head">
        <p className="eyebrow">CONFIRM THE BRIEF</p>
        <h1>
          読み取った条件を
          <br />
          確認してください
        </h1>
        <p className="lead">
          自由文に明記された条件だけを選択済みにしました。「未確認」は選び直してから計画を作ります。
        </p>
      </header>
      {interpretationStatus&&<p className="shared-draft-note" role="status">
        <strong>{interpretationStatus.mode==='provider'?`${interpretationStatus.providerName} が条件候補を抽出しました`:'外部AIは使用せず、決定ルールで条件を抽出しました'}</strong>{' '}
        {interpretationStatus.mode==='provider'?'候補は未確定です。各項目を確認してください。':interpretationStatus.fallbackReason==='not_configured'?'外部AIは設定されていません。Project Generatorはそのまま利用できます。':interpretationStatus.fallbackReason==='rate_limited'?'利用集中のため外部AIを呼ばず、安全なルール判定を使用しました。':'外部AIを利用できなかったため、安全なフォールバックを使用しました。'}
      </p>}
      {sharedDraft && (
        <p className="shared-draft-note" role="status">
          共有された構造化条件を読み込みました。元の自由文は共有URLに含まれません。未確認項目を選んでください。
        </p>
      )}
      {/(?:AI|ＡＩ).{0,8}(?:最大限|活用|使いたい)/i.test(brief.idea) && (
        <p className="shared-draft-note">
          <strong>AIを広く使う希望を確認しました。</strong>{" "}
          すべての工程を自動選択せず、下の「AIを使いたい制作工程」で必要な工程だけ選んでください。
        </p>
      )}
      {conflicts.length > 0 && (
        <section className="interpretation-conflicts" role="alert">
          <strong>入力内で複数の条件が見つかりました</strong>
          <p>
            どちらかを推測で選ばず「未確認」にしています。下の項目で選択してください。
          </p>
          <ul>
            {conflicts.map((item) => (
              <li key={item}>{conflictLabel(item)}</li>
            ))}
          </ul>
        </section>
      )}
      <section className="idea-review">
        <h2>入力したアイデア</h2>
        <blockquote>{brief.idea}</blockquote>
        <p>
          <span className="provenance explicit">明記</span>{" "}
          自由文から読み取った値　
          <span className="provenance confirmed">確認</span> ここで選んだ値
        </p>
      </section>
      <form
        className="clarify-form"
        onSubmit={(event) => {
          event.preventDefault();
          generate();
        }}
      >
        {detailCandidates.length > 0 && (
          <fieldset className="project-detail-review">
            <legend>
              ゲーム固有情報 <small>すべて確認必須</small>
            </legend>
            <p className="detail-privacy">
              入力文から抽出した未確定の候補です。AI利用時は要約候補の場合があります。原文と内容を確認し、計画へ含めるか選んでください。固有情報はアクセス解析・共有URLには含まれませんが、コピーやMarkdown保存には含まれます。
            </p>
            {detailCandidates.map((candidate) => {
              const decision = detailDecisions[candidate.id];
              return (
                <section
                  className={`project-detail-card ${decision ?? "pending"}`}
                  key={candidate.id}
                >
                  <label htmlFor={`project-detail-${candidate.id}`}>
                    抽出した固有情報
                  </label>
                  <textarea
                    id={`project-detail-${candidate.id}`}
                    maxLength={80}
                    rows={2}
                    value={candidate.text}
                    disabled={decision !== "include"}
                    onChange={(event) =>
                      editDetail(candidate, event.target.value)
                    }
                    aria-describedby={`project-detail-status-${candidate.id}${decision === "include" && !candidate.text.trim() ? " clarify-error" : ""}`}
                    aria-invalid={
                      decision === "include" && !candidate.text.trim()
                    }
                  />
                  <p
                    id={`project-detail-status-${candidate.id}`}
                    className="detail-status"
                  >
                    {decision === "include"
                      ? "計画に含めます。必要なら文を修正できます。"
                      : decision === "ignore"
                        ? "今回は計画に含めません。"
                        : "まだ確認されていません。"}
                  </p>
                  <div className="detail-actions">
                    <button
                      type="button"
                      aria-pressed={decision === "include"}
                      onClick={() => decideDetail(candidate, "include")}
                    >
                      計画に含める
                    </button>
                    <button
                      type="button"
                      aria-pressed={decision === "ignore"}
                      onClick={() => decideDetail(candidate, "ignore")}
                    >
                      今回は含めない
                    </button>
                  </div>
                </section>
              );
            })}
          </fieldset>
        )}
        {fields.map((field) => (
          <label key={field}>
            {fieldLabel(field)}
            {critical.includes(field) && <small>必須</small>}
            <select
              value={brief[field]}
              onChange={(event) => {
                update(field, event.target.value as never);
                setEvidence((old) => {
                  const next = new Set(old);
                  next.delete(field);
                  return next;
                });
                setConflicts((old) =>
                  old.filter((item) => !item.startsWith(`${field}:`)),
                );
                setError("");
                setProviderConfirmation((old)=>{const next=new Set(old);next.delete(field);return next;});
              }}
            >
              {Object.entries(labels[field]).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <span
              className={`provenance ${evidence.has(field) ? "explicit" : brief[field] === "unknown" ? "unknown" : "confirmed"}`}
            >
              {providerConfirmation.has(field)
                ? "AI抽出・要確認"
                : evidence.has(field)
                ? "入力文に明記"
                : brief[field] === "unknown"
                  ? "未確認"
                  : "ここで確認"}
            </span>
            {providerConfirmation.has(field)&&<button type="button" aria-label={`${fieldLabel(field)}のAI候補を確認`} onClick={()=>setProviderConfirmation(old=>{const next=new Set(old);next.delete(field);return next;})}>この候補を確認</button>}
          </label>
        ))}
        <fieldset className="capability-picker">
          <legend>
            AIを使いたい制作工程 <small>複数可</small>
          </legend>
          {projectCapabilities.map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                checked={brief.capabilities.includes(item)}
                onChange={() =>
                  update(
                    "capabilities",
                    brief.capabilities.includes(item)
                      ? brief.capabilities.filter((value) => value !== item)
                      : [...brief.capabilities, item],
                  )
                }
              />
              {capabilityLabels[item]}
            </label>
          ))}
          {providerConfirmation.has('capabilities')&&<button type="button" onClick={()=>setProviderConfirmation(old=>{const next=new Set(old);next.delete('capabilities');return next;})}>選択された制作工程を確認</button>}
        </fieldset>
        {error && (
          <p id="clarify-error" className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="clarify-actions">
          <button className="button" type="submit">
            Project Planを作る
          </button>
          <button
            className="button ghost"
            type="button"
            onClick={() => {
              sessionStorage.removeItem("gameai:project-idea");
              setBrief(null);
            }}
          >
            説明を書き直す
          </button>
        </div>
      </form>
    </div>
  );
}

function fieldLabel(field: Field) {
  return {
    genre: "ジャンル",
    dimension: "2D / 3D",
    platform: "公開先",
    engine: "ゲームエンジン",
    budget: "予算",
    experience: "制作経験",
    team: "チーム規模",
    commercialIntent: "利用目的",
    locale: "対応言語",
  }[field];
}
function conflictLabel(conflict: string) {
  const [field, values] = conflict.split(": ");
  return `${fieldLabel(field as Field) ?? field}: ${values}`;
}
function projectName(brief:ProjectBrief){
  const engine=brief.engine==='unknown'||brief.engine==='undecided'?'':`${labels.engine[brief.engine]} `;
  const dimension=brief.dimension==='unknown'?'':`${labels.dimension[brief.dimension]} `;
  const genre=brief.genre==='unknown'||brief.genre==='other'?'ゲーム制作':labels.genre[brief.genre];
  return `${engine}${dimension}${genre}プロジェクト`;
}
const questPhase:Record<string,string>={environment:'concept',repository:'concept','required-assets':'concept','core-loop':'code',save:'integration','ui-prototype':'integration','assets-2d':'visuals','assets-3d':'3d',animation:'animation',voice:'voice',music:'music-sfx',sfx:'music-sfx','npc-dialogue':'npc-dialogue',localization:'localization',qa:'testing','store-assets':'publishing',release:'publishing'};
const phaseLabels: Record<string, string> = {
  concept: "企画・スコープ",
  prototype: "プロトタイプ",
  code: "コアシステム",
  visuals: "2Dビジュアル",
  animation: "アニメーション",
  "3d": "3D素材",
  voice: "音声",
  "music-sfx": "音楽・効果音",
  "npc-dialogue": "NPC・会話",
  integration: "統合",
  testing: "テスト・QA",
  publishing: "公開",
  localization: "ローカライズ",
};
function BuildChecklist({steps,plan,onCopy}:{steps:BuildChecklistStep[];plan:ProjectPlan;onCopy:(content:string,artifact:string)=>void}){
  const [completed,setCompleted]=useState<Set<string>>(new Set());
  const [loaded,setLoaded]=useState(false);
  const [key,setKey]=useState("");
  useEffect(()=>{
    let cancelled=false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded(false); setCompleted(new Set()); setKey("");
    projectProgressKey(plan).then(nextKey=>{
      if(cancelled)return;
      const alias=`gameai:project-progress-alias:v2:${encodeProjectState(plan.brief)}`;
      let resolvedKey=nextKey;
      let next=new Set<string>();
      try{
        const isSharedPlaceholder=plan.brief.idea.startsWith("共有されたプロジェクト");
        resolvedKey=isSharedPlaceholder?(sessionStorage.getItem(alias)??nextKey):nextKey;
        if(!isSharedPlaceholder||!sessionStorage.getItem(alias))sessionStorage.setItem(alias,resolvedKey);
        const raw=localStorage.getItem(resolvedKey); const parsed=raw?JSON.parse(raw):null;
        if(parsed?.version===2&&Array.isArray(parsed.completed)){
          const allowed=new Set(steps.map(item=>item.id));
          next=new Set(parsed.completed.filter((id:unknown):id is string=>typeof id==='string'&&allowed.has(id)));
        }
      }catch{/* Malformed or unavailable storage fails closed. */}
      setKey(resolvedKey); setCompleted(next); setLoaded(true);
    }).catch(()=>{if(!cancelled)setLoaded(true);});
    return()=>{cancelled=true;};
  },[plan,steps]);
  useEffect(()=>{
    if(!loaded||!key)return;
    try{localStorage.setItem(key,JSON.stringify({version:2,completed:[...completed]}));}catch{/* In-memory progress remains usable. */}
  },[completed,key,loaded]);
  const currentIndex=steps.findIndex(item=>!completed.has(item.id));
  const today=steps.filter(item=>!completed.has(item.id)).slice(0,3);
  const activeStep=steps.find(item=>!completed.has(item.id));
  const currentPhase=activeStep?questPhase[activeStep.id]:null;
  const toggle=(id:string)=>setCompleted(old=>{const next=new Set(old);if(next.has(id))next.delete(id);else next.add(id);return next;});
  return <section className="build-checklist" aria-labelledby="build-progress-title">
    <div className="build-progress">
      <div><strong id="build-progress-title">プロジェクト進捗</strong><span aria-live="polite">{completed.size} / {steps.length} 完了</span></div>
      <progress value={completed.size} max={steps.length}>{completed.size} / {steps.length}</progress>
      <small>完了状態はこの端末だけに保存されます。</small>
    </div>
    <section className="today-queue" aria-labelledby="today-title"><div className="queue-heading"><span>今日の優先作業</span><h2 id="today-title">今日やること</h2><p>上から最大3件。成果物を作り、完了条件を満たしたら次へ進みます。</p></div>{today.length?<div className="today-grid">{today.map((item,index)=>{const tool=item.tools.find(value=>value.role==='primary');const stepNumber=steps.findIndex(value=>value.id===item.id)+1;return <article className={index===0?'is-primary':''} key={item.id}><header><b>{String(stepNumber).padStart(2,'0')}</b><span>{index===0?'今やる':'この次'}</span></header><h3>{item.title}</h3><p className="today-why"><strong>なぜ今：</strong>{item.why}</p><dl><div><dt>使用</dt><dd>{tool?<Link href={`/tools/${tool.serviceSlug}`}>{tool.name}</Link>:item.tools.length?'候補を要確認':'Manual'}</dd></div><div><dt>成果物</dt><dd>{item.outcome}</dd></div><div><dt>完了条件</dt><dd>{item.doneWhen[0]}</dd></div></dl><div className="today-actions">{tool?<button className={index===0?'button':'button ghost'} onClick={()=>onCopy(item.prompt,`today_${item.id}`)}>Promptをコピー</button>:<a className={index===0?'button':'button ghost'} href={`#quest-${item.id}`}>具体的操作を見る</a>}<a href={`#quest-${item.id}`}>Questを開く</a></div></article>})}</div>:<p className="quest-complete">全Quest完了。公開前のリスクと商用条件を再確認してください。</p>}</section>
    <section className="build-roadmap" aria-labelledby="roadmap-overview-title"><div><span>つながる制作工程</span><h2 id="roadmap-overview-title">Build Roadmap</h2><p>現在地と、次に受け渡す成果物を確認します。</p></div><ol>{plan.phases.map((phase,index)=>{const currentPhaseIndex=plan.phases.findIndex(item=>item.id===currentPhase);const related=steps.filter(item=>questPhase[item.id]===phase.id);const state=!activeStep?'complete':phase.id===currentPhase?'current':index<currentPhaseIndex?'complete':related.length>0&&related.every(item=>completed.has(item.id))?'complete':'upcoming';return <li className={state} key={phase.id}><span>{String(index+1).padStart(2,'0')}</span><div><strong>{phaseLabels[phase.title]??phase.title}</strong><small>{state==='complete'?(related.length?'完了':'通過'):state==='current'?'現在の工程':'この先'}</small><em>{phase.deliverables[0]}</em></div></li>})}</ol></section>
    <h2 className="checklist-heading">Build Quest</h2><p className="section-intro">各Questは必要なときだけ開きます。AI候補、具体的操作、Prompt、完了条件が一つにつながっています。</p>
    <div className="action-list">{steps.map((item,index)=>{
      const done=completed.has(item.id); const next=steps[index+1];
      return <details id={`quest-${item.id}`} className={`action-step ${done?'is-done':''}`} key={item.id} open={!done&&index===currentIndex}>
        <summary><span>{done?'COMPLETE':index===currentIndex?'CURRENT':'UPCOMING'}</span><strong>{index+1}. {item.title}</strong><small>{(item.tools.find(tool=>tool.role==='primary')?.name??(item.tools.length?'候補を要確認':'Manual'))} → {item.outcome}</small></summary>
        <div className="action-detail">
          <section><h3>何を作るか</h3><ol>{item.substeps.map(value=><li key={value}>{value}</li>)}</ol></section>
          <section><h3>なぜ必要か</h3><p>{item.why}</p></section>
          <section><h3>AI / ツール</h3>{item.tools.length?<PhaseTools tools={item.tools} phase={item.id}/>:<p>この工程は手動で進められます。AIツールは必須ではありません。</p>}</section>
          <section><h3>使い方</h3><ol>{item.usageInstructions.map(value=><li key={value}>{value}</li>)}</ol></section>
          <section className="action-prompt"><h3>このプロジェクト用プロンプト</h3><pre>{item.prompt}</pre><button onClick={()=>onCopy(item.prompt,`checklist_${item.id}`)}>プロンプトをコピー</button></section>
          <section className="active-done"><h3>完了条件</h3><ul>{item.doneWhen.map(value=><li key={value}>{value}</li>)}</ul></section>
          <p className="next-action"><strong>次：</strong>{next?.title??'チェックリスト完了。公開前の未確認事項を再確認する'}</p>
          <label className="completion-control"><input type="checkbox" checked={done} disabled={!loaded} onChange={()=>toggle(item.id)}/><span>{item.title}を完了として記録</span></label>
        </div>
      </details>})}</div>
  </section>;
}
function ProjectResult({
  plan,
  onEdit,
  headingRef,
}: {
  plan: ProjectPlan;
  onEdit: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const [status, setStatus] = useState("");
  const steps = useMemo(() => buildChecklist(plan), [plan]);
  const markdown = useMemo(() => planMarkdown(plan), [plan]);
  const copy = async (content: string, artifact: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setStatus(`${artifact}をコピーしました`);
      track("project_prompt_copy", { artifact });
    } catch {
      setStatus("コピーできません。下のテキストを選択してコピーしてください。");
    }
  };
  const share = async () => {
    const url = `${location.origin}/project?${encodeProjectState(plan.brief)}`;
    try {
      await navigator.clipboard.writeText(url);
      setStatus("構造化した条件だけを含む共有URLをコピーしました");
      track("project_share", { format: "url" });
    } catch {
      setStatus(
        "URLをコピーできませんでした。アドレスバーからコピーしてください。",
      );
    }
  };
  const download = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "game-project-plan.md";
    anchor.click();
    URL.revokeObjectURL(href);
    track("project_export", { format: "markdown" });
    setStatus("Markdownをダウンロードしました");
  };
  return (
    <article className="project-result">
      <header className="project-result-top">
        <p className="eyebrow">PROJECT BUILD COCKPIT</p>
        <h1 ref={headingRef} tabIndex={-1}>
          {projectName(plan.brief)}
        </h1>
        <p className="result-intro">{labels.dimension[plan.brief.dimension]}・{labels.genre[plan.brief.genre]}を、最初のプレイ可能なbuildから順に作る計画です。</p>
        <BuildChecklist steps={steps} plan={plan} onCopy={copy} />
        <p className="share-scope-note">
          共有URLには確認済みの構造化条件だけを含み、元の自由文や固有の物語設定は含みません。完全な計画はMarkdownで共有してください。
        </p>
      </header>
      <section className="assumption-strip">
        <strong>未確認事項</strong>
        {plan.unresolved.length ? (
          <ul>
            {plan.unresolved.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>計画生成に必要な主要条件は確認済みです。</p>
        )}
        <p>{plan.assumptions.join(" / ")}</p>
      </section>
      <details className="result-utilities"><summary>共有・書き出し・条件編集</summary><div className="project-result-actions">
          <button onClick={onEdit}>条件を編集</button><button onClick={() => copy(markdown, "markdown")}>Markdownをコピー</button><button onClick={download}>.md保存</button><button onClick={() => window.print()}>印刷</button><button onClick={share}>共有URL</button>
        </div><p className="copy-status" role="status" aria-live="polite">{status}</p></details>
      <details className="secondary-plan"><summary>工程・Prompt・リスクの詳細を見る</summary><div>
      <nav className="project-section-nav" aria-label="Project Plan内">
        <a href="#vertical-slice">最初の範囲</a>
        <a href="#roadmap">工程詳細</a>
        <a href="#handoff">Codex向け</a>
        <a href="#assets">素材</a>
        <a href="#risks">リスク</a>
      </nav>
      <PlanSection
        id="vertical-slice"
        eyebrow="VERTICAL SLICE"
        title="最初のプレイ可能範囲"
        intro="大量のコンテンツより先に、ゲームの成立性と後戻りの大きい技術を確認します。"
      >
        <div className="slice-grid">
          {plan.verticalSlice.map((item) => (
            <article key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.why}</p>
              <h4>完了条件</h4>
              <ul>
                {item.doneWhen.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
              <details>
                <summary>今回は作らないもの</summary>
                <ul>
                  {item.outOfScope.map((value) => (
                    <li key={value}>{value}</li>
                  ))}
                </ul>
              </details>
            </article>
          ))}
        </div>
      </PlanSection>
      <PlanSection
        id="roadmap"
        eyebrow="PRODUCTION ROADMAP"
        title="工程の詳細"
        intro="各工程は、主成果物を先に、ツールの根拠やリスクを後から確認できます。"
      >
        <div className="phase-list">
          {plan.phases.map((phase, index) => (
            <details key={phase.id} className="plan-phase" open={index === 0}>
              <summary>
                <span>PHASE {String(index + 1).padStart(2, "0")}</span>
                <strong>{phaseLabels[phase.title] ?? phase.title}</strong>
                <small>{phase.deliverables[0]}</small>
              </summary>
              <div>
                <Fact title="目的" values={[phase.objective]} />
                <Fact title="成果物" values={phase.deliverables} />
                {phase.tools.length ? (
                  <PhaseTools tools={phase.tools} phase={phase.id} />
                ) : (
                  <Fact title="AI / ツール経路" values={phase.toolPath} />
                )}
                <Fact title="人が行う作業" values={phase.manualWork} />
                <Fact
                  title="依存関係"
                  values={phase.dependencies.map(
                    (item) => phaseLabels[item] ?? item,
                  )}
                />
                <Fact title="リスク・要確認" values={phase.risks} warning />
                <Fact title="完了条件" values={phase.doneWhen} />
                <Fact title="次工程への引き渡し" values={[phase.handoff]} />
              </div>
            </details>
          ))}
        </div>
      </PlanSection>
      <PlanSection
        id="handoff"
        eyebrow="CODING-AGENT HANDOFF"
        title="Codexなどへ渡す作業指示"
        intro="そのまま貼る前に、現在のリポジトリやチーム規約に合わせて確認してください。"
      >
        <Artifact artifact={plan.masterBrief} onCopy={copy} />
        <Artifact artifact={plan.firstTask} onCopy={copy} />
        <details className="artifact-card">
          <summary>推奨リポジトリ構成</summary>
          <pre tabIndex={0}>{plan.repositoryStructure}</pre>
        </details>
        <Artifact artifact={plan.agentsStarter} onCopy={copy} />
      </PlanSection>
      <PlanSection
        id="assets"
        eyebrow="ASSETS & PROMPTS"
        title="必要素材とタスク別Prompt"
      >
        <ul className="checklist">
          {plan.assetChecklist.map((item) => (
            <li key={item}>
              <span aria-hidden="true">□</span>
              {item}
            </li>
          ))}
        </ul>
        <div className="prompt-grid">
          {plan.prompts.map((prompt) => (
            <article className="artifact-card" key={prompt.id}>
              <h3>{prompt.title}</h3>
              <pre>{prompt.content}</pre>
              <button
                onClick={() => copy(prompt.content, `prompt_${prompt.id}`)}
              >
                Promptをコピー
              </button>
            </article>
          ))}
        </div>
      </PlanSection>
      <PlanSection
        id="risks"
        eyebrow="RISKS & COST"
        title="公開前まで追跡するリスク"
      >
        <div className="risk-list">
          {plan.risks.map((risk) => (
            <article key={risk.id}>
              <h3>{risk.title}</h3>
              <p>
                <strong>重要な理由:</strong> {risk.why}
              </p>
              <p>
                <strong>対策:</strong> {risk.mitigation}
              </p>
              <p>
                <strong>確認:</strong> {risk.verification}
              </p>
            </article>
          ))}
        </div>
        <div className="cost-card">
          <h3>コストの見える範囲</h3>
          <ul>
            {plan.cost.categories.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>{plan.cost.note}</p>
        </div>
      </PlanSection>
      <section className="result-next">
        <h2>比較は必要になった時だけ</h2>
        <p>
          工程の候補を検証するときは、公式情報と最終確認日を含むツール詳細・比較を利用してください。
        </p>
        <div className="hero-actions">
          <Link className="button ghost" href="/tools">
            ツール情報を見る
          </Link>
          <Link className="text-link" href="/compare">
            候補を比較する →
          </Link>
        </div>
      </section>
      </div></details>
    </article>
  );
}
function PlanSection({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="project-plan-section">
      <p className="section-label">{eyebrow}</p>
      <h2>{title}</h2>
      {intro && <p className="section-intro">{intro}</p>}
      {children}
    </section>
  );
}
function Fact({
  title,
  values,
  warning = false,
}: {
  title: string;
  values: string[];
  warning?: boolean;
}) {
  if (!values.length) return null;
  return (
    <section className={warning ? "phase-warning" : ""}>
      <h4>{title}</h4>
      <ul>
        {values.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
function PhaseTools({ tools, phase }: { tools: PlanTool[]; phase: string }) {
  const primary = tools.find((tool) => tool.role === "primary");
  const alternatives = tools.filter((tool) => tool.role === "alternative");
  const review = tools.filter((tool) => tool.role === "review");
  return (
    <section className="phase-tools">
      <h4>AI / ツール候補</h4>
      <p className="fit-disclaimer">適合度は入力条件と確認済み製品情報の決定論的な一致です。品質、人気、法的許諾の評価ではありません。</p>
      {primary && (
        <PlanToolCard
          tool={primary}
          phase={phase}
          alternatives={alternatives}
        />
      )}{" "}
      {alternatives.map((tool) => (
        <PlanToolCard key={tool.serviceSlug} tool={tool} phase={phase} />
      ))}
      {review.map((tool) => (
        <PlanToolCard key={tool.serviceSlug} tool={tool} phase={phase} />
      ))}
    </section>
  );
}
function PlanToolCard({
  tool,
  phase,
  alternatives = [],
}: {
  tool: PlanTool;
  phase: string;
  alternatives?: PlanTool[];
}) {
  const service = getService(tool.serviceSlug);
  const status =
    tool.role === "primary"
      ? "条件一致候補"
      : tool.role === "alternative"
        ? "代替候補"
        : "要手動確認（推薦ではありません）";
  return (
    <article className={`plan-tool-card ${tool.role}`}>
      <header>
        <span>{status}</span>
        <h5>
          <Link href={`/tools/${tool.serviceSlug}`}>{tool.name}</Link>
        </h5>
        <p><strong>プロジェクト適合度: {tool.fitScore}/100（{tool.fitBand === "strong" ? "強い適合" : tool.fitBand === "good" ? "適合" : "要確認"}）</strong></p>
        <p>{tool.reason}</p>
        {tool.hardExclusions.length > 0 && <p className="phase-warning"><strong>必須条件未確認—推薦対象外:</strong> {tool.hardExclusions.join(" / ")}</p>}
      </header>
      <dl>
        <div>
          <dt>判断に使った入力</dt>
          <dd>{tool.inputRefs.join(" / ") || "工程要件"}</dd>
        </div>
        <div>
          <dt>検証済み情報</dt>
          <dd>{tool.evidence.join(" / ") || "登録用途との一致"}</dd>
        </div>
        <div>
          <dt>商用利用</dt>
          <dd>{factLabel(tool.commercialUse, "commercial")}</dd>
        </div>
        <div>
          <dt>無料プラン</dt>
          <dd>{factLabel(tool.freePlan, "availability")}</dd>
        </div>
        <div>
          <dt>API</dt>
          <dd>{factLabel(tool.api, "availability")}</dd>
        </div>
        <div>
          <dt>エンジン関連性</dt>
          <dd>{tool.engineRelevance.join(" / ") || "未確認"}</dd>
        </div>
      </dl>
      <details className="fit-details">
        <summary>適合度の根拠を見る</summary>
        <Fact title="スコアに影響した入力" values={tool.affectedInputs} />
        <Fact title="一致した条件" values={tool.positiveMatches} />
        <Fact title="警告" values={tool.warnings} warning />
        <Fact title="必須条件による除外" values={tool.hardExclusions} warning />
      </details>
      {tool.limitations.length > 0 && (
        <p>
          <strong>既知の制約:</strong> {tool.limitations.join(" / ")}
        </p>
      )}
      {[...tool.unknowns, ...tool.manualChecks].length > 0 && (
        <div className="tool-verification">
          <strong>不明・採用前に確認</strong>
          <ul>
            {[...tool.unknowns, ...tool.manualChecks].map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="candidate-verification">
        最終確認日: {tool.lastVerified} ·{" "}
        {tool.sources.map((source, index) => (
          <span key={source.url}>
            {index ? " / " : ""}
            <a href={source.url} target="_blank" rel="noopener">
              {source.label} ↗
            </a>
          </span>
        ))}
      </p>
      {tool.role === "primary" && service && (
        <>
          <OutboundLink
            service={service}
            page="project-result"
            placement={`phase-${phase}`}
          />
          {alternatives[0] && (
            <Link
              className="tool-compare-link"
              href={`/compare?ids=${tool.serviceSlug},${alternatives[0].serviceSlug}&stage=${phase}`}
            >
              代替候補と比較する →
            </Link>
          )}
        </>
      )}
    </article>
  );
}
function factLabel(value: string, kind: "commercial" | "availability") {
  return value === "yes"
    ? kind === "commercial"
      ? "確認済み: 可"
      : "確認済み: あり"
    : value === "no"
      ? kind === "commercial"
        ? "確認済み: 不可"
        : "確認済み: なし"
      : value === "conditional"
        ? "条件付き — 公式規約の確認が必要"
        : "不明";
}
function Artifact({
  artifact,
  onCopy,
}: {
  artifact: { title: string; content: string };
  onCopy: (value: string, name: string) => void;
}) {
  return (
    <details className="artifact-card">
      <summary>{artifact.title}</summary>
      <pre tabIndex={0}>{artifact.content}</pre>
      <button
        onClick={() =>
          onCopy(
            artifact.content,
            artifact.title.toLowerCase().replaceAll(" ", "_"),
          )
        }
      >
        コピー
      </button>
    </details>
  );
}
function planMarkdown(plan: ProjectPlan) {
  return [
    `# Game Project Plan`,
    ``,
    plan.brief.idea,
    ``,
    `## 今日やること`,
    ...plan.today.map((item) => `- ${item}`),
    ``,
    `## Vertical Slice`,
    ...plan.verticalSlice.flatMap((item) => [
      `### ${item.title}`,
      item.why,
      ``,
      ...item.doneWhen.map((value) => `- Done when: ${value}`),
      ...item.outOfScope.map((value) => `- Out of scope: ${value}`),
      ``,
    ]),
    `## Production Roadmap`,
    ...plan.phases.flatMap((phase, index) => [
      `### ${index + 1}. ${phaseLabels[phase.title] ?? phase.title}`,
      `Objective: ${phase.objective}`,
      ``,
      ...phase.deliverables.map((value) => `- Deliverable: ${value}`),
      ...phase.doneWhen.map((value) => `- Done when: ${value}`),
      `- Handoff: ${phase.handoff}`,
      ``,
    ]),
    `## Master implementation brief`,
    `\`\`\`md`,
    plan.masterBrief.content,
    "```",
    ``,
    `## First task`,
    `\`\`\`md`,
    plan.firstTask.content,
    "```",
    ``,
    `## Repository structure`,
    "```text",
    plan.repositoryStructure,
    "```",
    ``,
    `## Asset checklist`,
    ...plan.assetChecklist.map((item) => `- [ ] ${item}`),
    ``,
    `## Risks`,
    ...plan.risks.flatMap((risk) => [
      `### ${risk.title}`,
      `- Why: ${risk.why}`,
      `- Mitigation: ${risk.mitigation}`,
      `- Verify: ${risk.verification}`,
    ]),
    ``,
    `## Cost visibility`,
    ...plan.cost.categories.map((item) => `- ${item}`),
    plan.cost.note,
  ].join("\n");
}
