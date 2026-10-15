import type { Metadata } from 'next';
import Link from 'next/link';
import { TrustPage, TrustStatus } from '@/components/TrustPage';
export const metadata:Metadata={title:'調査・評価方法',alternates:{canonical:'/methodology/'},openGraph:{url:'/methodology/'}};
export default function Page(){return <TrustPage eyebrow="EDITORIAL METHOD" title="調査・評価方法" summary={<p>掲載数や報酬額ではなく、ゲーム制作の意思決定に必要な情報かを基準にします。公式文書の確認と、実際の製品テストは同じ意味ではありません。</p>} updated="2026-08-25" sections={[
{id:'evidence-status',label:'確認状態の意味',content:<><div className="trust-status-grid"><TrustStatus tone="verified" title="確認済み"><p>記載した確認日に公式サイト、料金、規約、ドキュメントを閲覧し、掲載内容と照合した状態です。実制作での操作・性能評価を意味しません。</p></TrustStatus><TrustStatus tone="partial" title="一部確認"><p>判断に必要な公式資料の一部を確認できた状態です。未確認の項目は推測しません。</p></TrustStatus><TrustStatus tone="stale" title="再確認が必要"><p>確認から時間が経ち、更新の可能性がある状態です。契約や公開の前に公式資料を確認してください。</p></TrustStatus><TrustStatus tone="unknown" title="不明"><p>公式資料で確認できない値です。類似サービスや古い情報から補完しません。</p></TrustStatus></div></>},
{id:'sources',label:'情報源と更新',content:<><ol><li>公式サイト、料金、規約、ドキュメントを一次情報として記録します。</li><li>確認日と情報源を各詳細ページに表示します。</li><li>料金・規約は30日、API・対応環境は60日を再確認の目安とします。</li></ol><p>「最終確認日」は文書を照合した日で、内容が現在も不変であることや継続的な監視を保証する日付ではありません。</p></>},
{id:'hands-on',label:'文書確認と製品テスト',content:<><p>公式文書で機能や条件を確認することと、実際のゲーム制作で操作性・品質・性能を検証することを分けて扱います。文書確認だけの項目を、ハンズオン評価済みとは表示しません。</p><p>価格、性能、人気、難易度、品質の勝者を、根拠なしに推測しません。</p></>},
{id:'recommendations',label:'推薦と比較の根拠',content:<><p>Projectは入力条件と掲載済みフィールドの一致を決定ルールで判定します。主観的な性能テストや人気順ではありません。候補の根拠、既知の制約、不明事項、参照元を分けて表示します。</p><p><Link href="/compare/">比較ページ</Link>も、自動で勝者や点数を作らず、選択した候補の差分と公式確認先を示します。</p></>},
{id:'commercial',label:'商用利用と法的判断',content:<><p>商用利用の記載は、公式文書で確認できた情報の要約であり、法的助言や保証ではありません。契約・公開前に、利用時点のプランと最新規約を確認してください。</p></>},
{id:'revenue',label:'順位と収益の分離',content:<><p>アフィリエイトの有無や報酬率は、掲載順、推薦結果、比較の結論、視覚的な優先度へ入力しません。長所と弱点を併記し、公式リンクを確認できます。</p><p><Link href="/affiliate-disclosure/">広告・アフィリエイト開示を読む</Link></p></>},
]}/>}
