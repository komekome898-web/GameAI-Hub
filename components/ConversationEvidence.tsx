import type { ReactNode } from 'react';

/** 会話記録の話者。色ではなく常時表示のラベルで識別する。 */
export type ConversationSpeaker='owner'|'fable';

export type ConversationTurn={
 speaker:ConversationSpeaker;
 /** 発言の位置づけを示す短い印。例「第1の指摘」「事前登録」。省略可。 */
 marker?:string;
 /** 逐語に近い本文。段落・箇条書き・code をそのまま渡せる。 */
 body:ReactNode;
};

/** 会話の下に置く編集注記。警告ではなく研究ノートとして扱う。 */
export type ConversationAnnotation={label?:string;question?:string;answer:ReactNode};

export type ConversationEvidenceProps={
 /** 図としての見出し。何のやり取りかを一文で。 */
 title:string;
 /** 見出しレベル。記事内の階層に合わせる。 */
 headingLevel?:2|3|4;
 /** アイブロー。既定は CONVERSATION EVIDENCE。 */
 label?:string;
 /** 会話の前提を短く説明する任意の一文。 */
 context?:string;
 /** 引用元の記録。リポジトリ内のドキュメントパスなど。 */
 source?:{label:string;href?:string};
 /** 記録日 (YYYY-MM-DD)。 */
 recordedAt?:string;
 turns:ConversationTurn[];
 annotation?:ConversationAnnotation;
};

const speakers={
 owner:{name:'OWNER',sub:'オーナー（人間）',reading:'発言者は人間のオーナー、'},
 fable:{name:'FABLE 5.1',sub:'Claude Code',reading:'発言者はAI、'},
} as const;

/** タイトルから決定的に id を作る（サーバーコンポーネントのままにするため useId は使わない）。 */
function slugId(value:string){let hash=0;for(const char of value)hash=(hash*31+char.codePointAt(0)!)>>>0;return `conv-${hash.toString(36)}`}

/**
 * 記事本文に置く会話記録カード。左右の吹き出しではなく、話者ラベル付きの縦一列の台帳として並べる。
 * 話者は常時表示のラベル・補助ラベル・スクリーンリーダー用の前置きで判別でき、色は補助にとどめる。
 */
export function ConversationEvidence({title,headingLevel=3,label='CONVERSATION EVIDENCE',context,source,recordedAt,turns,annotation}:ConversationEvidenceProps){
 if(!turns.length)return null;
 const headingId=slugId(title);
 const Heading=`h${headingLevel}` as const;
 return <figure className="conv-evidence" aria-labelledby={headingId}>
  <figcaption className="conv-evidence-head">
   <p className="conv-evidence-label">{label}</p>
   <Heading className="conv-evidence-title" id={headingId}>{title}</Heading>
   {context&&<p className="conv-evidence-context">{context}</p>}
   {(recordedAt||source)&&<p className="conv-evidence-meta">
    {recordedAt&&<span>記録 <time dateTime={recordedAt}>{recordedAt}</time></span>}
    {source&&<span>出典 {source.href?<a href={source.href} rel="noopener" target="_blank"><code>{source.label}</code></a>:<code>{source.label}</code>}</span>}
   </p>}
  </figcaption>
  <ol className="conv-turns">
   {turns.map((turn,index)=>{const speaker=speakers[turn.speaker];return <li className={`conv-turn conv-turn--${turn.speaker}`} key={index}>
    <p className="conv-speaker">
     <span className="sr-only">{speaker.reading} </span>
     <span className="conv-speaker-name">{speaker.name}</span>
     <span className="conv-speaker-sub">{speaker.sub}</span>
     {turn.marker&&<span className="conv-turn-marker">{turn.marker}</span>}
    </p>
    <div className="conv-turn-body">{turn.body}</div>
   </li>})}
  </ol>
  {annotation&&<div className="conv-note">
   <p className="conv-note-label">{annotation.label??'RESEARCH NOTE'}</p>
   {annotation.question&&<p className="conv-note-question">{annotation.question}</p>}
   <div className="conv-note-answer">{annotation.answer}</div>
  </div>}
 </figure>
}
