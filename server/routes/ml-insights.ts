import { Router } from 'express';
import { GeospatialOptimizer, type GeospatialInsight, type CoverageAnalysis } from '../ml-geospatial-optimizer.js';
import { DataEnhancer, type ClinicEnhancement } from '../ml-data-enhancer.js';

const router = Router();

// Geospatial analysis endpoints
router.get('/api/ml/coverage-analysis', async (req, res) => {
  try {
    const optimizer = new GeospatialOptimizer();
    const analysis = await optimizer.analyzeGeospatialCoverage();
    
    res.json({
      success: true,
      data: analysis,
      message: `Coverage analysis complete. ${analysis.totalCoverage.toFixed(1)}% coverage identified.`
    });
  } catch (error) {
    console.error('Coverage analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze coverage',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

router.get('/api/ml/optimal-locations/:count?', async (req, res) => {
  try {
    const count = parseInt(req.params.count || '5');
    const optimizer = new GeospatialOptimizer();
    const locations = await optimizer.identifyOptimalClinicPlacements(count);
    
    res.json({
      success: true,
      data: locations,
      message: `Found ${locations.length} optimal expansion locations.`
    });
  } catch (error) {
    console.error('Optimal locations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to identify optimal locations',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Data enhancement endpoints
router.post('/api/ml/enhance-data', async (req, res) => {
  try {
    const { limit = 50 } = req.body;
    const enhancer = new DataEnhancer();
    
    const enhancements = await enhancer.enhanceClinicData(limit);
    const appliedCount = await enhancer.applyEnhancements(enhancements);
    
    res.json({
      success: true,
      data: {
        enhancementsGenerated: enhancements.length,
        enhancementsApplied: appliedCount,
        enhancements: enhancements.slice(0, 10) // Return sample
      },
      message: `Enhanced ${appliedCount} clinic records with improved data.`
    });
  } catch (error) {
    console.error('Data enhancement error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enhance data',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

router.get('/api/ml/detect-duplicates', async (req, res) => {
  try {
    const enhancer = new DataEnhancer();
    const duplicates = await enhancer.detectDuplicates();
    
    res.json({
      success: true,
      data: duplicates,
      message: `Found ${duplicates.length} potential duplicate clinic entries.`
    });
  } catch (error) {
    console.error('Duplicate detection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect duplicates',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Combined ML insights endpoint
router.get('/api/ml/insights', async (req, res) => {
  try {
    const optimizer = new GeospatialOptimizer();
    const enhancer = new DataEnhancer();
    
    // Run analysis in parallel
    const [coverageAnalysis, optimalLocations, duplicates] = await Promise.all([
      optimizer.analyzeGeospatialCoverage(),
      optimizer.identifyOptimalClinicPlacements(5),
      enhancer.detectDuplicates()
    ]);
    
    res.json({
      success: true,
      data: {
        coverage: coverageAnalysis,
        expansion: optimalLocations,
        dataQuality: {
          duplicatesFound: duplicates.length,
          topDuplicates: duplicates.slice(0, 5)
        }
      },
      message: 'ML insights generated successfully.'
    });
  } catch (error) {
    console.error('ML insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate ML insights',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;