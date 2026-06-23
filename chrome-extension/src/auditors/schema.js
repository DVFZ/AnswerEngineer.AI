/**
 * Auditor #2: Schema Markup
 * Evaluates JSON-LD, structured data, microdata
 */
export class SchemaAuditor {
    static audit(pageData) {
        const findings = [];
        let score = 100;
        // Check for JSON-LD schemas
        if (pageData.schemaMarkup.length === 0) {
            findings.push('No JSON-LD schema markup found');
            score -= 40;
        }
        else {
            findings.push(`✓ ${pageData.schemaMarkup.length} JSON-LD schema(s) found`);
            // Check for important schema types
            const foundTypes = pageData.schemaMarkup
                .flatMap((s) => this.extractTypes(s))
                .filter((t) => this.IMPORTANT_SCHEMAS.includes(t));
            if (foundTypes.length === 0) {
                findings.push('⚠ No recognized schema types detected');
                score -= 15;
            }
            else {
                findings.push(`✓ Found schemas: ${foundTypes.join(', ')}`);
                score -= Math.max(0, 20 - foundTypes.length * 5); // Bonus for multiple schemas
            }
            // Validate schema structure
            for (const schema of pageData.schemaMarkup) {
                const validation = this.validateSchema(schema);
                if (!validation.valid) {
                    findings.push(`⚠ Schema validation issues: ${validation.errors.join('; ')}`);
                    score -= 10;
                }
            }
        }
        // Check for meta tags (Open Graph, Twitter Card)
        const ogPresent = !!document.querySelector('meta[property="og:title"]');
        const twitterPresent = !!document.querySelector('meta[name="twitter:card"]');
        if (ogPresent) {
            findings.push('✓ Open Graph tags present');
        }
        else {
            findings.push('Missing Open Graph tags');
            score -= 10;
        }
        if (twitterPresent) {
            findings.push('✓ Twitter Card tags present');
        }
        else {
            findings.push('Missing Twitter Card tags');
            score -= 5;
        }
        // Check for microdata (Schema.org microdata)
        const microdataCount = document.querySelectorAll('[itemtype]').length;
        if (microdataCount > 0) {
            findings.push(`✓ Microdata found (${microdataCount} items)`);
        }
        return {
            id: 'schema',
            name: 'Schema Markup',
            score: Math.max(0, score),
            weight: 1.0,
            findings,
            status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail',
        };
    }
    static extractTypes(schema) {
        const types = [];
        if (schema['@type']) {
            const type = schema['@type'];
            if (Array.isArray(type)) {
                types.push(...type);
            }
            else {
                types.push(type);
            }
        }
        // Recursively check nested objects
        Object.values(schema).forEach((value) => {
            if (value && typeof value === 'object' && '@type' in value) {
                types.push(...this.extractTypes(value));
            }
        });
        return types;
    }
    static validateSchema(schema) {
        const errors = [];
        // Check for @context
        if (!schema['@context']) {
            errors.push('Missing @context');
        }
        // Check for required type
        if (!schema['@type']) {
            errors.push('Missing @type');
        }
        // For Article schema, check for important fields
        if (schema['@type']?.includes('Article')) {
            if (!schema.headline)
                errors.push('Article missing headline');
            if (!schema.datePublished)
                errors.push('Article missing datePublished');
            if (!schema.author)
                errors.push('Article missing author');
        }
        // For Organization schema
        if (schema['@type']?.includes('Organization')) {
            if (!schema.name)
                errors.push('Organization missing name');
            if (!schema.url)
                errors.push('Organization missing url');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
}
SchemaAuditor.IMPORTANT_SCHEMAS = [
    'Organization',
    'WebPage',
    'Article',
    'BreadcrumbList',
    'LocalBusiness',
    'Product',
    'AggregateRating',
];
//# sourceMappingURL=schema.js.map