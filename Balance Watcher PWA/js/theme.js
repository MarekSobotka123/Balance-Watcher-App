// theme.js

function applyTheme(theme) {
    // console.log('switching to:', theme)
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(`${theme}-theme`);
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    // Apply the theme immediately when the script is loaded
    applyTheme(savedTheme);
} else {
    // Default to light theme if no theme is saved
    applyTheme('light');
}

document.addEventListener('DOMContentLoaded', function () {
    const themeSwitch = document.getElementById('theme-switch');

    if (themeSwitch) {
        themeSwitch.checked = savedTheme === 'dark';

        themeSwitch.addEventListener('change', function () {
            const newTheme = this.checked ? 'dark' : 'light';
            applyTheme(newTheme);

            // Save the theme preference in local storage
            localStorage.setItem('theme', newTheme);
        });
    }
});
