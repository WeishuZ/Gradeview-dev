import { React, useMemo, useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Grid } from '@mui/material';
import userData from '../data/studentScore copy.json';
import { Histogram } from '@ant-design/plots';
import apiv2 from "../utils/apiv2";
import axios from "axios";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper 
} from '@mui/material';

const seperateByLevel = (baseData, levelCount) => {

    const count = Math.max(1, parseInt(levelCount, 10) || 1);
    const courseRange = 10 / count;

    return baseData.map(item => {
        const newItem = { Assignment: item.Assignment };
        // 初始化所有level数组
        for (let i = 1; i <= count; i++) {
            newItem[`level${i}`] = [];
        }

        // 对每个学生的分数进行分级
        item.scores.forEach((student) => {
            const level = Math.min(Math.floor(student.score / courseRange) + 1, count);
            const levelKey = `level${level}`;
            newItem[levelKey].push({
                id: student.id,
                score: student.score
            });
        });

        return newItem;
    });
};

const DemoHistogram = ({ assignmentName, detailData }) => {
    const assignmentData = detailData.find(item => item.Assignment === assignmentName);
    const config = useMemo(() => ({
        data: assignmentData?.scores || [],
        style: {
            inset: 0.5,
        },
        binField: 'score',
        binNumber: 10,
        xAxis: {
            title: {
                text: `Scores for ${assignmentName}`,
            },
        },
        yAxis: {
            title: {
                text: 'Count',
            },
        },
        tooltip: {
            showMarkers: false,
            fields: ['score'],
        },
    }), [assignmentName, assignmentData]);

    if (!assignmentData) {
        return <div>No data available for {assignmentName}</div>;
    }

    return <Histogram {...config} />;
};

const StudentsInfo = ({ assignmentName, detailData }) => {
    const assignmentData = detailData.find(item => item.Assignment === assignmentName);
    const scores = assignmentData?.scores || [];
    return (
        <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="Students Info Table">
            
            <TableHead>
            <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Score</TableCell>
            </TableRow>
            </TableHead>
            
            <TableBody>
            {scores.map((student) => (
                <TableRow
                key={student.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f5f5f5' } }}
                >
                <TableCell component="th" scope="row">
                    {student.id}
                </TableCell>
                <TableCell component="th" scope="row">
                    {student.score}
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </TableContainer>
    );
}
async function fetchStudentScores(studentId) {
    try {
        const response = await apiv2.get(`/students/${studentId}/grades`);
        return response.data;
    } catch (error) {
        console.error('Error fetching student scores:', error);
        return null;
    }
}

/**
 * NivoBarChart component renders a responsive stacked bar chart 
 * using the @nivo/bar library to visualize student concept mastery levels.
 * @returns {JSX.Element} The NivoBarChart component.
 */
export default function NivoBarChart() {
    const [studentScores, setStudentScores] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadScores = async () => {
            setLoading(true);
            const data = await fetchStudentScores('weszhang@berkeley.edu');
            console.log('Fetched student scores:', data);
            setStudentScores(data);
            setLoading(false);
        };
        loadScores();
    }, []);


    const [levelCount, setLevelCount] = useState(4);
    const [assignmentToShow, setAssignmentToShow] = useState(userData[0]?.Assignment || '');

    const levelData = useMemo(() => {
        return seperateByLevel(userData, levelCount);
    }, [levelCount]);

    const keys = useMemo(() => {
        return Array.from({ length: levelCount }, (_, i) => `level${i + 1}`);
    }, [levelCount]);

    const barData = useMemo(() => {
        return levelData.map(item => {
            const barItem = { Assignment: item.Assignment };
            keys.forEach(key => {
                barItem[key] = item[key].length;
            });
            return barItem;
        });
    }, [levelData, keys]);

    const handleBarClick = (data) => {
        setAssignmentToShow(data.indexValue);
    };

    return (
        <div>
            <div style={{ height: 400, width: '100%' }}>
                <ResponsiveBar
                    data={barData}
                    keys={keys}
                    indexBy="Assignment"
                    onClick={handleBarClick}
                    margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                    padding={0.3}
                    layout="horizontal"
                    groupMode="stacked"
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={{ scheme: 'nivo' }}
                    borderColor={{
                        from: 'color',
                        modifiers: [['darker', 1.6]]
                    }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Assignments',
                        legendPosition: 'middle',
                        legendOffset: 32,
                        truncateTickAt: 0
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Level Count',
                        legendPosition: 'middle',
                        legendOffset: -40,
                        truncateTickAt: 0
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{
                        from: 'color',
                        modifiers: [['darker', 1.6]]
                    }}
                    legends={[
                        {
                            dataFrom: 'keys',
                            anchor: 'bottom-right',
                            direction: 'column',
                            justify: false,
                            translateX: 120,
                            translateY: 0,
                            itemsSpacing: 2,
                            itemWidth: 100,
                            itemHeight: 20,
                            itemDirection: 'left-to-right',
                            itemOpacity: 0.85,
                            symbolSize: 20,
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemOpacity: 1
                                    }
                                }
                            ]
                        }
                    ]}
                    role="application"
                    ariaLabel="Nivo Concept Mastery Bar Chart"
                />
            </div>
 
            <div style={{ marginTop: '20px' }}>
                <label htmlFor="levelCount">Select Level Count: </label>
                <select
                    id="levelCount"
                    value={levelCount}
                    onChange={(e) => setLevelCount(Number(e.target.value))}
                >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                        <option key={count} value={count}>
                            {count}
                        </option>
                    ))}
                </select>
            </div>
            <div style={{ height: 400, width: '100%' }}>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <DemoHistogram 
                        assignmentName={assignmentToShow} 
                        detailData={userData} 
                    />
                </Grid>
                <Grid item xs={6}>
                    <StudentsInfo
                        assignmentName={assignmentToShow} 
                        detailData={userData} 
                    />
                </Grid>
            </Grid>
        </div>
        </div>
    );
}