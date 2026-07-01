const fs = require('fs');
const path = require('path');

const dirPath = 'c:/Users/SWETHA/Desktop/stackly';

const files = fs.readdirSync(dirPath);

files.forEach(file => {
    if (file.endsWith('.html') || file === 'style.css') {
        const filePath = path.join(dirPath, (file === 'style.css' ? 'css/style.css' : file));
        if (!fs.existsSync(filePath)) return;
        
        let content = fs.readFileSync(filePath, 'utf-8');

        // Fix Hamburger z-index so close icon is visible above the nav menu
        if (content.includes('.hamburger {') || content.includes('.hamburger{')) {
            content = content.replace(/\.hamburger\s*\{([^}]*)\}/gi, (match, inner) => {
                if (!inner.includes('z-index')) {
                    return `.hamburger {${inner} position: relative; z-index: 2000; }`;
                }
                return match;
            });
        }

        // Fix Footer text colors to pure black (#000)
        // .footer-brand p
        content = content.replace(/\.footer-brand\s*p\s*\{\s*color:\s*[^;]+;/gi, '.footer-brand p { color: #000;');
        
        // .footer-col h5
        content = content.replace(/\.footer-col\s*h5\s*\{\s*(font-family:[^;]+;\s*font-size:[^;]+;\s*text-transform:[^;]+;\s*letter-spacing:[^;]+;\s*margin-bottom:[^;]+;\s*color:)\s*[^;]+;\s*\}/gi, 
            '.footer-col h5 { $1 #000; }');
        content = content.replace(/\.footer-col\s*h5\s*\{\s*font-size:\s*0\.8rem;\s*text-transform:\s*uppercase;\s*letter-spacing:\s*0\.1em;\s*margin-bottom:\s*20px;\s*color:\s*[^;]+;\s*\}/gi, 
            '.footer-col h5 {\n      font-size: 0.8rem;\n      text-transform: uppercase;\n      letter-spacing: 0.1em;\n      margin-bottom: 20px;\n      color: #000;\n    }');

        // .footer-col a
        content = content.replace(/\.footer-col\s*a\s*\{\s*display:\s*block;\s*color:\s*[^;]+;/gi, '.footer-col a { display:block; color: #000;');
        content = content.replace(/\.footer-col\s*a\s*\{\s*color:\s*[^;]+;/gi, '.footer-col a { color: #000;');
        content = content.replace(/\.footer-col\s*a:hover\s*\{\s*color:\s*[^;]+;\s*\}/gi, '.footer-col a:hover { color: #000; }');

        // .footer-social a
        content = content.replace(/\.footer-social\s*a\s*\{\s*width:\s*3[68]px;\s*height:\s*3[68]px;\s*border:\s*1px\s*solid\s*[^;]+;/gi, 
            '.footer-social a { width: 38px; height: 38px; border: 1px solid #000; color: #000;');
        
        // Ensure svg inherits or sets color
        content = content.replace(/\.footer-social\s*svg\s*\{\s*width:\s*[^;]+;\s*height:\s*[^;]+;\s*\}/gi, 
            '$& stroke: #000; fill: none;');

        // .footer-bottom
        content = content.replace(/\.footer-bottom\s*\{\s*border-top:\s*1px\s*solid\s*[^;]+;\s*padding-top:\s*[^;]+;\s*display:\s*flex;\s*justify-content:\s*space-between;\s*(align-items:\s*center;\s*)?(color:\s*[^;]+;\s*)?/gi, 
            '.footer-bottom {\n      border-top: 1px solid #000;\n      padding-top: 24px;\n      display: flex;\n      justify-content: space-between;\n      align-items: center;\n      color: #000;\n    ');
        content = content.replace(/\.footer-bottom\{\s*border-top:1px\s*solid\s*[^;]+;\s*padding-top:26px;\s*display:flex;\s*justify-content:space-between;\s*padding-left:54px;\s*padding-right:32px;\s*font-size:\.8rem;\s*color:[^;]+;/gi, 
            '.footer-bottom{ border-top:1px solid #000; padding-top:26px; display:flex; justify-content:space-between; padding-left:54px; padding-right:32px; font-size:.8rem; color:#000;');

        // .footer-brand .logo
        content = content.replace(/\.footer-brand\s*\.logo\s*\{\s*color:\s*[^;]+;/gi, '.footer-brand .logo { color: #000;');

        fs.writeFileSync(filePath, content, 'utf-8');
    }
});
