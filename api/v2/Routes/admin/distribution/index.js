import { Router } from 'express';
import { getStudents, getStudentScores } from '../../../../lib/redisHelper.mjs'; 
const router = Router({ mergeParams: true });

/**
 * GET /admin/distribution/:section/:name
 * Returns score distribution (histogram data)
 * Returns: { freq: [count0, count1, ...], bins: number, min, max, binWidth }
 */
router.get('/:section/:name', async (req, res) => {
    try {
        const { section, name } = req.params;
        const students = await getStudents(); 

        const scorePromises = students.map(async student => {
            const studentId = student[1]; 
            
            const studentScores = await getStudentScores(studentId); 
            
            const score = studentScores[section] ? studentScores[section][name] : null;
            
            if (score != null && score !== '') {
                return Number(score);
            }
            return null;
        });

        const rawScores = await Promise.all(scorePromises);
        
        const scores = rawScores.filter(score => score !== null);

        if (scores.length === 0) {
            return res.json({ freq: [], bins: 0, min: 0, max: 0, binWidth: 0 });
        }

        
        const max = Math.max(...scores);
        const min = Math.min(...scores);
        const defaultBins = 10;
        
        const binWidth = (max - min) / defaultBins;
        const bins = defaultBins; 
        
        const freq = Array(bins + 1).fill(0); 

        scores.forEach(score => {
            let binIndex = Math.floor((score - min) / binWidth);

            if (score === max) {
                 binIndex = bins;
            } else if (binIndex > bins) { 
                 binIndex = bins;
            } else if (binIndex < 0) {
                 binIndex = 0;
            }

            freq[binIndex]++;
        });

        res.json({
            freq,
            bins: defaultBins, 
            min,
            max,
            binWidth: parseFloat(binWidth.toFixed(4))
        });
    } catch (error) {
        console.error('Error fetching distribution:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch distribution' });
    }
});

export default router;