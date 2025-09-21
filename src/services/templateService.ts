import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import { RoleTemplate, TemplateVariables } from '../types';
import { config } from '../config';

class TemplateService {
  private templates: Map<string, RoleTemplate> = new Map();
  private compiledTemplates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.loadTemplates();
  }

  /**
   * Load all templates from the templates directory
   */
  private loadTemplates(): void {
    this.initializeTemplatesFromFiles();
  }

  /**
   * Initialize templates from HTML files
   */
  private initializeTemplatesFromFiles(): void {
    const templateConfigs = [
      {
        id: 'backend-developer',
        role: 'backend-developer',
        name: 'Backend Developer Application',
        subject: 'Application for {{position}} Position',
        htmlFilePath: 'backend.html',
        variables: ['companyName', 'position', 'aboutCompany', 'whyInterested', 'generalAboutMe', 'whyBestFit', 'trackingId', 'trackingUrl']
      },
      {
        id: 'platform-engineer',
        role: 'platform-engineer',
        name: 'Platform Engineer Application',
        subject: 'Application for {{position}} Position',
        htmlFilePath: 'platform.html',
        variables: ['companyName', 'position', 'aboutCompany', 'whyInterested', 'generalAboutMe', 'whyBestFit', 'trackingId', 'trackingUrl']
      },
      {
        id: 'intern',
        role: 'intern',
        name: 'Internship Application',
        subject: 'Application for {{position}} Internship',
        htmlFilePath: 'intern.html',
        variables: ['companyName', 'position', 'aboutCompany', 'whyInterested', 'generalAboutMe', 'whyBestFit', 'trackingId', 'trackingUrl']
      },
      {
        id: 'general',
        role: 'general',
        name: 'General Software Developer Application',
        subject: 'Application for {{position}} Position',
        htmlFilePath: 'general.html',
        variables: ['companyName', 'position', 'aboutCompany', 'whyInterested', 'generalAboutMe', 'whyBestFit', 'trackingId', 'trackingUrl']
      }
    ];

    // Load each template
    templateConfigs.forEach(templateConfig => {
      try {
        const template: RoleTemplate = {
          ...templateConfig,
          htmlFilePath: path.join(config.templates.directory, templateConfig.htmlFilePath)
        };

        this.templates.set(template.role, template);
        console.log(`✅ Loaded template: ${template.name}`);
      } catch (error) {
        console.error(`❌ Failed to load template ${templateConfig.role}:`, error);
      }
    });

    // Compile templates
    this.compileTemplates();
  }

  /**
   * Load HTML content from file
   */
  private loadHtmlTemplate(filePath: string): string {
    try {
      const fullPath = path.resolve(filePath);
      return fs.readFileSync(fullPath, 'utf-8');
    } catch (error) {
      console.error(`Error loading HTML template from ${filePath}:`, error);
      throw new Error(`Failed to load template file: ${filePath}`);
    }
  }

  /**
   * Compile all templates using Handlebars
   */
  private compileTemplates(): void {
    for (const [role, template] of this.templates) {
      try {
        const htmlContent = this.loadHtmlTemplate(template.htmlFilePath);
        const compiled = Handlebars.compile(htmlContent);
        this.compiledTemplates.set(role, compiled);
        console.log(`✅ Compiled template: ${template.name}`);
      } catch (error) {
        console.error(`❌ Failed to compile template ${role}:`, error);
      }
    }
  }

  /**
   * Reload templates from files (useful for development)
   */
  reloadTemplates(): void {
    this.templates.clear();
    this.compiledTemplates.clear();
    this.loadTemplates();
    console.log('🔄 Templates reloaded');
  }

  /**
   * Get all available templates
   */
  getAvailableTemplates(): RoleTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by role
   */
  getTemplate(role: string): RoleTemplate | null {
    return this.templates.get(role) || null;
  }

  /**
   * Render template with variables
   */
  renderTemplate(role: string, variables: TemplateVariables): { subject: string; html: string } | null {
    const template = this.templates.get(role);
    const compiledTemplate = this.compiledTemplates.get(role);

    if (!template || !compiledTemplate) {
      return null;
    }

    try {
      // Compile subject template
      const subjectTemplate = Handlebars.compile(template.subject);
      const subject = subjectTemplate(variables);
      const html = compiledTemplate(variables);

      return { subject, html };
    } catch (error) {
      console.error(`Error rendering template ${role}:`, error);
      return null;
    }
  }

  /**
   * Validate template variables
   */
  validateVariables(role: string, variables: TemplateVariables): { isValid: boolean; missingVariables: string[] } {
    const template = this.templates.get(role);
    
    if (!template) {
      return { isValid: false, missingVariables: [] };
    }

    // Don't require tracking variables for validation as they're added automatically
    const requiredVariables = template.variables.filter(v => 
      !v.includes('tracking') && v !== 'trackingId' && v !== 'trackingUrl'
    );

    const missingVariables = requiredVariables.filter(variable => 
      !variables.hasOwnProperty(variable) || variables[variable] === undefined || variables[variable] === ''
    );

    return {
      isValid: missingVariables.length === 0,
      missingVariables
    };
  }

  /**
   * Update template file (for external updates)
   */
  async updateTemplateFile(role: string, htmlContent: string): Promise<boolean> {
    try {
      const template = this.templates.get(role);
      if (!template) {
        throw new Error(`Template not found: ${role}`);
      }

      // Write to file
      fs.writeFileSync(template.htmlFilePath, htmlContent, 'utf-8');
      
      // Recompile this specific template
      const compiled = Handlebars.compile(htmlContent);
      this.compiledTemplates.set(role, compiled);
      
      console.log(`✅ Updated template file: ${role}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to update template ${role}:`, error);
      return false;
    }
  }
}

export const templateService = new TemplateService();
