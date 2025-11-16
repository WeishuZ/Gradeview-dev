import { Router } from 'express';
import { getStudents, getStudentScores } from '../../../../lib/redisHelper.mjs'; 

const router = Router({ mergeParams: true });

/**
 * GET /admin/student-scores
 * Returns all student scores in the format expected by admin.jsx
 */
router.get('/', async (req, res) => {
    try {
        const students = await getStudents();
        console.log('Fetched students for scores:', students.length);

        const studentDataPromises = students.map(async (student) => {
            const studentId = student[1]; 
            
            const scores = await getStudentScores(studentId); 

            return {
                name: student[0] || 'Unknown',
                email: student[1] || '',
                scores: scores || {}
            };
        });

        const formattedStudents = await Promise.all(studentDataPromises);

        res.json({
            students: formattedStudents
        });
    } catch (error) {
        console.error('Error fetching student scores:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to fetch student scores',
            students: []
        });
    }
});

export default router;