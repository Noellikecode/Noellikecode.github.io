#!/usr/bin/env tsx

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface ClinicEnhancement {
  id: string;
  enhancements: {
    name?: string;
    phone?: string;
    website?: string;
    email?: string;
    services?: string[];
    notes?: string;
    confidence: number;
  };
  dataSource: string;
  timestamp: Date;
}

interface ValidationResult {
  field: string;
  original: any;
  suggested: any;
  confidence: number;
  reasoning: string;
}

class DataEnhancer {
  private readonly COMMON_SERVICES = [
    'speech-therapy', 'language-therapy', 'voice-therapy', 'stuttering', 
    'apraxia', 'feeding-therapy', 'swallowing', 'autism', 'social-skills',
    'neurological', 'pediatric', 'adult', 'teletherapy'
  ];

  private readonly PHONE_PATTERNS = [
    /\((\d{3})\)\s*(\d{3})-?(\d{4})/,  // (555) 123-4567
    /(\d{3})-(\d{3})-(\d{4})/,         // 555-123-4567
    /(\d{3})\.(\d{3})\.(\d{4})/,       // 555.123.4567
    /(\d{10})/                         // 5551234567
  ];

  private readonly EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  private readonly WEBSITE_PATTERN = /(https?:\/\/[^\s]+)|(www\.[^\s]+\.[a-z]{2,})/gi;

  // ML-powered name standardization patterns
  private readonly NAME_STANDARDIZATION_RULES = [
    // Remove common legal suffixes
    { pattern: /\s*(LLC|Inc\.?|Corporation|Corp\.?|P\.?A\.?|PLLC|L\.?L\.?C\.?)$/gi, replacement: '' },
    // Standardize "Speech" variations
    { pattern: /\bSpeech\s*&\s*Language\b/gi, replacement: 'Speech-Language' },
    { pattern: /\bSLP\b/gi, replacement: 'Speech-Language Pathology' },
    // Standardize therapy terminology
    { pattern: /\bTherapy\s*Services?\b/gi, replacement: 'Therapy Center' },
    { pattern: /\bRehabilitation\b/gi, replacement: 'Rehab' },
    // Clean up spacing and punctuation
    { pattern: /\s+/g, replacement: ' ' },
    { pattern: /^[\s\-,]+|[\s\-,]+$/g, replacement: '' }
  ];

  // Intelligent service extraction from text
  private extractServicesFromText(text: string): string[] {
    const lowerText = text.toLowerCase();
    const extractedServices: string[] = [];

    // Define service keywords and their mappings
    const serviceKeywords = {
      'speech-therapy': ['speech therapy', 'speech pathology', 'articulation', 'pronunciation'],
      'language-therapy': ['language therapy', 'language development', 'communication', 'language disorders'],
      'voice-therapy': ['voice therapy', 'vocal therapy', 'voice disorders', 'vocal rehabilitation'],
      'stuttering': ['stuttering', 'fluency', 'disfluency', 'stammering'],
      'apraxia': ['apraxia', 'childhood apraxia', 'motor speech'],
      'feeding-therapy': ['feeding therapy', 'swallowing', 'dysphagia', 'oral motor'],
      'autism': ['autism', 'asd', 'autism spectrum', 'developmental'],
      'social-skills': ['social skills', 'pragmatics', 'social communication'],
      'neurological': ['neurological', 'stroke', 'brain injury', 'tbi'],
      'pediatric': ['pediatric', 'children', 'child', 'kids', 'infant'],
      'adult': ['adult', 'geriatric', 'elderly', 'senior'],
      'teletherapy': ['teletherapy', 'telehealth', 'online', 'virtual', 'remote']
    };

    for (const [service, keywords] of Object.entries(serviceKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        extractedServices.push(service);
      }
    }

    return Array.from(new Set(extractedServices)); // Remove duplicates
  }

  // Standardize clinic names using ML-like rules
  private standardizeName(name: string): string {
    let standardized = name.trim();
    
    for (const rule of this.NAME_STANDARDIZATION_RULES) {
      standardized = standardized.replace(rule.pattern, rule.replacement);
    }
    
    return standardized.trim();
  }

  // Extract and format phone numbers
  private extractPhone(text: string): string | null {
    for (const pattern of this.PHONE_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        if (match.length === 2) {
          // For 10-digit number
          const digits = match[1];
          return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
        } else if (match.length === 4) {
          // For captured groups
          return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
      }
    }
    return null;
  }

  // Extract email addresses
  private extractEmail(text: string): string | null {
    const matches = text.match(this.EMAIL_PATTERN);
    return matches ? matches[0] : null;
  }

  // Extract website URLs
  private extractWebsite(text: string): string | null {
    const matches = text.match(this.WEBSITE_PATTERN);
    if (matches) {
      let url = matches[0];
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      return url;
    }
    return null;
  }

  // Calculate confidence score based on data quality
  private calculateConfidence(original: any, enhanced: any): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on data completeness
    if (enhanced.phone && this.extractPhone(enhanced.phone)) confidence += 0.2;
    if (enhanced.email && this.extractEmail(enhanced.email)) confidence += 0.2;
    if (enhanced.website && this.extractWebsite(enhanced.website)) confidence += 0.1;
    if (enhanced.services && enhanced.services.length > 0) confidence += 0.1;
    
    // Decrease confidence if major changes
    if (original.name && enhanced.name && original.name !== enhanced.name) confidence -= 0.1;
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  // Detect and remove duplicate clinics
  async detectDuplicates(): Promise<Array<{original: any, duplicate: any, similarity: number}>> {
    console.log('🔍 Detecting duplicate clinics...');
    
    const clinics = await sql`
      SELECT id, name, city, state, phone, latitude, longitude 
      FROM clinics 
      ORDER BY name
    `;

    const duplicates: Array<{original: any, duplicate: any, similarity: number}> = [];

    for (let i = 0; i < clinics.length; i++) {
      for (let j = i + 1; j < clinics.length; j++) {
        const clinic1 = clinics[i];
        const clinic2 = clinics[j];
        
        const similarity = this.calculateSimilarity(clinic1, clinic2);
        
        if (similarity > 0.8) { // High similarity threshold
          duplicates.push({
            original: clinic1,
            duplicate: clinic2,
            similarity
          });
        }
      }
    }

    console.log(`Found ${duplicates.length} potential duplicates`);
    return duplicates;
  }

  private calculateSimilarity(clinic1: any, clinic2: any): number {
    let similarity = 0;
    let factors = 0;

    // Name similarity (most important)
    if (clinic1.name && clinic2.name) {
      const nameSim = this.stringSimilarity(
        clinic1.name.toLowerCase().trim(),
        clinic2.name.toLowerCase().trim()
      );
      similarity += nameSim * 0.4;
      factors += 0.4;
    }

    // Location similarity
    if (clinic1.city && clinic2.city && clinic1.state && clinic2.state) {
      if (clinic1.city.toLowerCase() === clinic2.city.toLowerCase() &&
          clinic1.state.toLowerCase() === clinic2.state.toLowerCase()) {
        similarity += 0.3;
      }
      factors += 0.3;
    }

    // Phone similarity
    if (clinic1.phone && clinic2.phone) {
      const phone1 = clinic1.phone.replace(/\D/g, '');
      const phone2 = clinic2.phone.replace(/\D/g, '');
      if (phone1 === phone2) {
        similarity += 0.2;
      }
      factors += 0.2;
    }

    // Coordinate proximity
    if (clinic1.latitude && clinic1.longitude && clinic2.latitude && clinic2.longitude) {
      const distance = this.calculateDistance(
        clinic1.latitude, clinic1.longitude,
        clinic2.latitude, clinic2.longitude
      );
      if (distance < 0.5) { // Within 0.5 miles
        similarity += 0.1;
      }
      factors += 0.1;
    }

    return factors > 0 ? similarity / factors : 0;
  }

  private stringSimilarity(str1: string, str2: string): number {
    // Simple Levenshtein distance-based similarity
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Main enhancement function
  async enhanceClinicData(limit: number = 50): Promise<ClinicEnhancement[]> {
    console.log(`🔧 Enhancing clinic data (processing ${limit} records)...`);
    
    const clinics = await sql`
      SELECT id, name, city, state, phone, website, email, services, notes
      FROM clinics 
      WHERE verified = true
      ORDER BY updated_at ASC
      LIMIT ${limit}
    `;

    const enhancements: ClinicEnhancement[] = [];

    for (const clinic of clinics) {
      const enhanced: any = {};
      let hasChanges = false;

      // Enhance name
      const standardizedName = this.standardizeName(clinic.name);
      if (standardizedName !== clinic.name && standardizedName.length > 0) {
        enhanced.name = standardizedName;
        hasChanges = true;
      }

      // Extract and validate phone
      if (clinic.notes || clinic.name) {
        const phoneText = `${clinic.notes || ''} ${clinic.name || ''}`;
        const extractedPhone = this.extractPhone(phoneText);
        if (extractedPhone && extractedPhone !== clinic.phone) {
          enhanced.phone = extractedPhone;
          hasChanges = true;
        }
      }

      // Extract email
      if (clinic.notes && !clinic.email) {
        const extractedEmail = this.extractEmail(clinic.notes);
        if (extractedEmail) {
          enhanced.email = extractedEmail;
          hasChanges = true;
        }
      }

      // Extract website
      if (clinic.notes && !clinic.website) {
        const extractedWebsite = this.extractWebsite(clinic.notes);
        if (extractedWebsite) {
          enhanced.website = extractedWebsite;
          hasChanges = true;
        }
      }

      // Enhance services
      const allText = `${clinic.name || ''} ${clinic.notes || ''}`;
      const extractedServices = this.extractServicesFromText(allText);
      let currentServices: string[] = [];
      try {
        currentServices = clinic.services ? JSON.parse(clinic.services) : [];
      } catch (error) {
        // Handle case where services is not valid JSON (e.g., plain text)
        currentServices = clinic.services ? [clinic.services] : [];
      }
      
      // Merge and deduplicate services
      const enhancedServices = Array.from(new Set([...currentServices, ...extractedServices]));
      if (enhancedServices.length > currentServices.length) {
        enhanced.services = enhancedServices;
        hasChanges = true;
      }

      if (hasChanges) {
        enhanced.confidence = this.calculateConfidence(clinic, enhanced);
        
        enhancements.push({
          id: clinic.id,
          enhancements: enhanced,
          dataSource: 'ML Data Enhancement',
          timestamp: new Date()
        });
      }
    }

    console.log(`✨ Generated ${enhancements.length} enhancements`);
    return enhancements;
  }

  // Apply enhancements to database
  async applyEnhancements(enhancements: ClinicEnhancement[]): Promise<number> {
    let appliedCount = 0;

    for (const enhancement of enhancements) {
      try {
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (enhancement.enhancements.name) {
          updates.push(`name = $${paramIndex++}`);
          values.push(enhancement.enhancements.name);
        }
        if (enhancement.enhancements.phone) {
          updates.push(`phone = $${paramIndex++}`);
          values.push(enhancement.enhancements.phone);
        }
        if (enhancement.enhancements.email) {
          updates.push(`email = $${paramIndex++}`);
          values.push(enhancement.enhancements.email);
        }
        if (enhancement.enhancements.website) {
          updates.push(`website = $${paramIndex++}`);
          values.push(enhancement.enhancements.website);
        }
        if (enhancement.enhancements.services) {
          updates.push(`services = $${paramIndex++}`);
          values.push(JSON.stringify(enhancement.enhancements.services));
        }

        if (updates.length > 0) {
          updates.push(`updated_at = NOW()`);
          values.push(enhancement.id);
          
          const query = `
            UPDATE clinics 
            SET ${updates.join(', ')} 
            WHERE id = $${paramIndex}
          `;
          
          await sql(query, values);
          appliedCount++;
        }
      } catch (error) {
        console.error(`Failed to apply enhancement for ${enhancement.id}:`, error);
      }
    }

    console.log(`✅ Applied ${appliedCount} enhancements to database`);
    return appliedCount;
  }
}

// Export for use in API routes
export { DataEnhancer, type ClinicEnhancement, type ValidationResult };

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const enhancer = new DataEnhancer();
  
  enhancer.enhanceClinicData(100)
    .then(async (enhancements) => {
      console.log('\n📊 Enhancement Summary:');
      
      const byType = enhancements.reduce((acc, enh) => {
        Object.keys(enh.enhancements).forEach(key => {
          if (key !== 'confidence') {
            acc[key] = (acc[key] || 0) + 1;
          }
        });
        return acc;
      }, {} as {[key: string]: number});

      Object.entries(byType).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} improvements`);
      });

      // Apply enhancements
      const applied = await enhancer.applyEnhancements(enhancements);
      console.log(`\n🎯 Applied ${applied} enhancements to database`);

      // Detect duplicates
      const duplicates = await enhancer.detectDuplicates();
      console.log(`\n🔍 Found ${duplicates.length} potential duplicate clinics`);
      
      duplicates.slice(0, 5).forEach((dup, i) => {
        console.log(`${i + 1}. "${dup.original.name}" vs "${dup.duplicate.name}" (${(dup.similarity * 100).toFixed(1)}% similar)`);
      });
    })
    .catch(console.error);
}