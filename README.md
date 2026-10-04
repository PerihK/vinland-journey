# Vinland — a gentler beginning

An independent atmospheric web journey inspired by the idea of peaceful life in Vinland Saga. Real northern landscape photography and a continuous scroll-driven flight above a forest river.

This is a fictional artistic concept, with no relationship to a real estate development or an official anime website. It is separate from the Kromka experiment and Kirill's portfolio.

## Development

No dependencies or build step. Run `npm start` and open http://127.0.0.1:4192. Run `npm run check` for syntax, asset references, anchor targets and the static asset budget.

## Motion

Native scrolling drives a sticky aerial scene. Two procedural SVG cloud layers clear at different depths while a bounded camera gradually zooms and pans along the river. The scene has no chapter cards or map flags; exit mist blends into the next section. A portrait crop of the same real river photograph preserves the composition on phones. Motion respects `prefers-reduced-motion`, which shows a static landscape without the long scroll sequence. Navigation and a flight skip link work with a keyboard. All arrows are SVG. No video, WebGL or animation libraries are required.

## Deployment

Vercel serves `dist/` directly. Publish as its own project. Do not add to the portfolio without the owner's request.

## Assets

All landscape scenes use licensed Unsplash photography, with native originals above 4K; see ASSETS.md and /photography.html. The small cloud texture uses SVG turbulence and soft masks, reused by both cloud layers. Fonts are local Cormorant Garamond and Roboto, with licenses included in dist/fonts. Source JPEGs and browser QA captures are local and ignored; published photographs are compressed WebP.
