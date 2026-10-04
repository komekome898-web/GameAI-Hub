/** Reader purpose, deliberately separate from an article's editorial category. */
export const articlePurposes = [
  { id: 'start', title: 'ゲーム制作をはじめる', description: 'まず動く小さなゲームを作り、AIへ渡す条件と完了基準を決めます。' },
  { id: '3d', title: '画像と3D素材を作る', description: '1点の生成と取り込みを先に試し、料金とライセンスを別々に確認します。' },
  { id: 'voice', title: '音と声を作る', description: '代表セリフの制作から商用公開前の権利確認まで、順番に判断します。' },
  { id: 'practice', title: '制作の体験談と学び', description: 'AIの「できた」を鵜呑みにせず、失敗から制作の進め方を整えます。' },
  { id: 'games', title: 'AIで作ったゲームを遊ぶ', description: 'AIを使って制作したゲームを、見どころや遊び方と一緒に紹介します。' },
] as const;
export type ArticlePurpose = typeof articlePurposes[number]['id'];
