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
 /** 引用元の記録。監査用に保持するが、読者向けカードには表示しない。 */
 source:{label:string;href?:string};
 /** 記録日 (YYYY-MM-DD)。証跡として必須。 */
 recordedAt:string;
 turns:ConversationTurn[];
 /** 同一ページに同じ title のカードを複数置く場合の明示 id。 */
 id?:string;
 /** 見出しレベル。記事内の階層に合わせる。字面は階層によらず一定。 */
 headingLevel?:2|3|4;
 /** アイブロー。既定は CONVERSATION EVIDENCE。 */
 label?:string;
 /** 会話の前提を短く説明する任意の一文。要約・抜粋である旨もここに書く。 */
 context?:string;
 annotation?:ConversationAnnotation;
};

const speakers={
 owner:{name:'OWNER',sub:'オーナー（人間）',subLang:'ja',reading:'発言者は人間のオーナー、'},
 fable:{name:'FABLE 5.1',sub:'Claude Code',subLang:'en',reading:'発言者はAI、'},
} as const;

/** ラテン文字だけのラベルにのみ lang="en" を付ける（日本語ラベルを英語音で読ませない）。 */
function latinLang(value:string){return /^[\u0020-\u007e]+$/.test(value)?'en':undefined}

/** タイトルから決定的に id を作る（サーバーコンポーネントのままにするため useId は使わない）。 */
function slugId(value:string){let hash=0;for(const char of value)hash=(hash*31+char.codePointAt(0)!)>>>0;return `conv-${hash.toString(36)}`}

/**
 * 記事本文に置く会話記録カード。左右の吹き出しではなく、話者ラベル付きの縦一列の台帳として並べる。
 * 話者は常時表示のラベル・補助ラベル・スクリーンリーダー用の前置きで判別でき、色は補助にとどめる。
 */
export function ConversationEvidence({title,source: _source,recordedAt,turns,id,headingLevel=3,label='CONVERSATION EVIDENCE',context,annotation}:ConversationEvidenceProps){
 if(!turns.length)return null;
 const headingId=id??slugId(title);
 const Heading=`h${headingLevel}` as const;
 const annotationLabel=annotation?.label??'RESEARCH NOTE';
 return <figure className="conv-evidence" aria-labelledby={headingId}>
  <figcaption className="conv-evidence-head">
   <p className="conv-evidence-label" lang={latinLang(label)}>{label}</p>
   <Heading className="conv-evidence-title" id={headingId}>{title}</Heading>
   {context&&<p className="conv-evidence-context">{context}</p>}
   <p className="conv-evidence-meta">
    <span>記録 <time dateTime={recordedAt}>{recordedAt}</time></span>
    <span>発言 {turns.length} 件</span>
   </p>
  </figcaption>
  <ol className="conv-turns" role="list">
   {turns.map((turn,index)=>{const speaker=speakers[turn.speaker];return <li className={`conv-turn conv-turn--${turn.speaker}`} key={index}>
    <p className="conv-speaker">
     <span className="sr-only">{speaker.reading}</span>
     <span className="conv-speaker-name" lang="en">{speaker.name}</span>
     <span className="conv-speaker-sub" lang={speaker.subLang}>{speaker.sub}</span>
     {turn.marker&&<span className="conv-turn-marker">{turn.marker}</span>}
    </p>
    <div className="conv-turn-body">{turn.body}</div>
   </li>})}
  </ol>
  {annotation&&<div className="conv-note">
   <p className="conv-note-label" lang={latinLang(annotationLabel)}>{annotationLabel}</p>
   {annotation.question&&<p className="conv-note-question">{annotation.question}</p>}
   <div className="conv-note-answer">{annotation.answer}</div>
  </div>}
 </figure>
}
