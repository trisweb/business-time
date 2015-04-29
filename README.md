# business-time
Know your business

## Development

1. `npm install`
2. `bower install`
3. `gulp watch`

Use the livereload extension (available in the chrome store) if you want.

If you add/remove bower packages (from `bower.json`), run `gulp bower-files` to repackage them into vendor.js, which is included in the app.

## Deploy

Copy the `css`, `img`, `js`, and `index.html` files to the deployment server. The app is a standard HTML5 page with no backend services.