const html = require('gulp-preprocess').inlineText(__dirname + '/popup.html');
const lsKey = 'popup-are-you-there';

export const exists = new Promise(resolve => {
  window.addEventListener('storage', event => {
    if (event.key == lsKey && event.newValue == 'yes') {
      resolve(true);
    }
  });

  localStorage.setItem(lsKey, Math.random());

  setTimeout(() => {
    resolve(false);
  }, 100);
});

export function create(notesEl) {
  const win = window.open(null, 'notes',
    'menubar=no,toolbar=no,location=no,status=no'
  );

  win.document.open();
  win.document.write(html);
  win.document.close();

  win.document.body.appendChild(notesEl);
}
