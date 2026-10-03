# Vinland — a gentler beginning

An independent atmospheric web journey inspired by the idea of peaceful life in Vinland Saga. Real northern landscape photography, a cloud-to-valley scroll sequence and three places to explore: shore, fields and home.

This is a fictional artistic concept, with no relationship to a real estate development or an official anime website. It is separate from the Kromka experiment and Kirill's portfolio.

## Development

No dependencies or build step. Run `npm start` and open http://127.0.0.1:4192. Run `npm run check` for syntax, asset references, anchor targets and the static asset budget.

## Motion

Native scrolling drives a sticky aerial scene. Separate transparent cloud layers clear the terrain; three flags rise on the landscape. Shore, fields and home unfold automatically during scrolling, with optional flag shortcuts. Bounded camera movement stays gentle. A portrait crop of the same real river photograph preserves the composition on phones. Motion respects `prefers-reduced-motion`; navigation and all place selectors work with a keyboard. All arrows are SVG.

## Deployment

Vercel serves `dist/` directly. Publish as its own project. Do not add to the portfolio without the owner's request.

## Assets

All landscape scenes use licensed Unsplash photography, with native originals above 4K; see ASSETS.md and /photography.html. Only the existing alpha cloud layer remains generated. Fonts are local Cormorant Garamond and Roboto, with licenses included in dist/fonts. Source JPEGs and browser QA captures are local and ignored; published assets are compressed WebP.
