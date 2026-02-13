import { THEMES, ThemeConfig } from '../src/features/theming/ThemeSystem';

console.log('Validating Theme Configuration...');

const validateColor = (color: string, fieldName: string) => {
    if (!color) {
        console.error(`❌ Missing color for ${fieldName}`);
        return false;
    }
    // Basic check: is it a hex code or a tailwind class?
    if (!color.startsWith('#') && !color.startsWith('bg-') && !color.startsWith('text-') && !color.startsWith('border-')) {
        console.warn(`⚠️ Potential invalid color format for ${fieldName}: "${color}"`);
    }
    return true;
};

let hasErrors = false;

Object.entries(THEMES).forEach(([key, theme]) => {
    console.log(`\nChecking Theme: [${key}] - ${theme.id}`);

    // Check required fields
    if (!theme.id) { console.error('❌ Missing ID'); hasErrors = true; }
    if (!theme.colors.primaryButton) { console.error('❌ Missing primaryButton color'); hasErrors = true; }

    // Validate key colors
    validateColor(theme.colors.background, 'background');
    validateColor(theme.colors.text, 'text');
    validateColor(theme.colors.accent, 'accent');
    validateColor(theme.colors.node.bg, 'node.bg');
    validateColor(theme.colors.primaryButton, 'primaryButton');

    console.log(`✅ Theme [${key}] passed basic checks.`);
});

if (hasErrors) {
    console.error('\n❌ Validation FAILED. Please fix theme errors.');
    process.exit(1);
} else {
    console.log('\n✨ All themes validated successfully!');
}
