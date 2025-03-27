const fs = require('fs');

const file = process.argv[2];

const content = fs.readFileSync(file, 'utf-8')
    .replace(
        /"#\/\$defs\/https%3A~1~1schema\.croct\.com~1json~1(.+?)\.json"/g,
        (_, match) => `"#/$defs/${match.replace(/~1/g, '-')}"`,
    )
    .replace(
        /"https:\/\/schema.croct.com\/json\/(.+?)\.json"/g,
        (_, match) => `"${match.replace(/\//g, '-')}"`
    );


fs.writeFileSync(file, content, 'utf-8');
