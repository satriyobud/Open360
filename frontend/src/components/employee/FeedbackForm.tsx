import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Alert,
  Divider,
  Chip,
  Avatar,
  Paper
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Star,
  StarBorder
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api.ts';
import toast from 'react-hot-toast';

interface Question {
  id: number;
  text: string;
  category: {
    id: number;
    name: string;
  };
}

interface FeedbackData {
  questionId: number;
  score: number;
  comment: string;
}

const FeedbackForm: React.FC = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [activeStep, setActiveStep] = useState(0);
  const [feedbackData, setFeedbackData] = useState<{ [key: number]: FeedbackData }>({});
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  const { data: assignment, isLoading } = useQuery(
    ['assignment', assignmentId],
    async () => {
      const response = await api.get(`/assignments/${assignmentId}`);
      return response.data;
    },
    { enabled: !!assignmentId }
  );

  const { data: questions } = useQuery(
    'questions',
    async () => {
      const response = await api.get('/questions');
      return response.data;
    }
  );

  const { data: existingFeedbacks } = useQuery(
    ['feedbacks', assignmentId],
    async () => {
      const response = await api.get(`/feedbacks/assignment/${assignmentId}`);
      return response.data;
    },
    { enabled: !!assignmentId }
  );

  const submitMutation = useMutation(
    (data: FeedbackData) => api.post('/feedbacks', {
      reviewAssignmentId: parseInt(assignmentId!),
      questionId: data.questionId,
      score: data.score,
      comment: data.comment || null
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['feedbacks', assignmentId]);
        toast.success('Feedback submitted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to submit feedback');
      }
    }
  );

  useEffect(() => {
    if (existingFeedbacks && questions) {
      const existingData: { [key: number]: FeedbackData } = {};
      existingFeedbacks.forEach((feedback: any) => {
        existingData[feedback.questionId] = {
          questionId: feedback.questionId,
          score: feedback.score,
          comment: feedback.comment || ''
        };
      });
      setFeedbackData(existingData);
    }
  }, [existingFeedbacks, questions]);

  useEffect(() => {
    if (questions && questions.length > 0) {
      const uniqueCategories = [...new Set(questions.map((q: Question) => q.category.name))];
      setCategories(uniqueCategories);
      setCurrentCategory(uniqueCategories[0]);
    }
  }, [questions]);

  // Scroll to top whenever category changes
  useEffect(() => {
    if (currentCategory) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, [currentCategory]);

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (!assignment) {
    return (
      <Alert severity="error">
        Assignment not found. Please check your assignments list.
      </Alert>
    );
  }

  const currentCategoryQuestions = questions?.filter((q: Question) => q.category.name === currentCategory) || [];

  const handleScoreChange = (questionId: number, score: number) => {
    setFeedbackData(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        score,
        comment: prev[questionId]?.comment || ''
      }
    }));
  };

  const handleCommentChange = (questionId: number, comment: string) => {
    setFeedbackData(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        score: prev[questionId]?.score || undefined, // Don't set default score, let user select
        comment
      }
    }));
  };

  const handleNext = () => {
    const currentIndex = categories.indexOf(currentCategory);
    if (currentIndex < categories.length - 1) {
      setCurrentCategory(categories[currentIndex + 1]);
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    const currentIndex = categories.indexOf(currentCategory);
    if (currentIndex > 0) {
      setCurrentCategory(categories[currentIndex - 1]);
      setActiveStep(activeStep - 1);
    }
  };

  const handleNextCategory = () => {
    // Check if all questions in current category have valid scores
    const missingScores = currentCategoryQuestions.filter(q => 
      !feedbackData[q.id] || 
      feedbackData[q.id].score === undefined || 
      feedbackData[q.id].score < 1 || 
      feedbackData[q.id].score > 5
    );
    
    if (missingScores.length > 0) {
      toast.error('Please select a score (1-5) for all questions before proceeding');
      return;
    }
    
    // Just move to next category, don't submit yet
    handleNext();
  };

  const handleSubmitAll = async () => {
    try {
      // Check if all questions in current category have valid scores
      const missingScores = currentCategoryQuestions.filter(q => 
        !feedbackData[q.id] || 
        feedbackData[q.id].score === undefined || 
        feedbackData[q.id].score < 1 || 
        feedbackData[q.id].score > 5
      );
      
      if (missingScores.length > 0) {
        toast.error('Please select a score (1-5) for all questions before proceeding');
        return;
      }
      
      // Get all feedback data for all categories, not just current
      const allFeedbackData = Object.values(feedbackData).filter(data => 
        data && data.score !== undefined && data.score >= 1 && data.score <= 5
      );
      
      console.log('All feedback data to submit:', allFeedbackData);
      
      if (allFeedbackData.length === 0) {
        toast.error('No valid feedback to submit');
        return;
      }
      
      // Submit all feedback
      for (const data of allFeedbackData) {
        console.log('Submitting feedback:', data);
        await submitMutation.mutateAsync(data);
      }

      toast.success('All feedback submitted successfully!');
      navigate('/employee/assignments');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  const isCurrentCategoryComplete = () => {
    return currentCategoryQuestions.every(q => 
      feedbackData[q.id] && 
      feedbackData[q.id].score !== undefined && 
      feedbackData[q.id].score >= 1 && 
      feedbackData[q.id].score <= 5
    );
  };

  const getRelationTypeColor = (type: string) => {
    switch (type) {
      case 'SELF': return 'default';
      case 'MANAGER': return 'primary';
      case 'PEER': return 'secondary';
      case 'SUBORDINATE': return 'success';
      default: return 'default';
    }
  };

  // Check if cycle has started
  const isCycleStarted = () => {
    if (!assignment?.reviewCycle?.startDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(assignment.reviewCycle.startDate);
    startDate.setHours(0, 0, 0, 0);
    return startDate <= today;
  };

  // Check if cycle has ended
  const isCycleEnded = () => {
    if (!assignment?.reviewCycle?.endDate) return false;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const endDate = new Date(assignment.reviewCycle.endDate);
    endDate.setHours(23, 59, 59, 999);
    return today > endDate;
  };

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (!assignment) {
    return <Box>Assignment not found</Box>;
  }

  const cycleStarted = isCycleStarted();
  const cycleEnded = isCycleEnded();

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/employee/assignments')}
          sx={{ mr: 2 }}
        >
          Back to Assignments
        </Button>
        <Typography variant="h4">
          Feedback Form
        </Typography>
      </Box>

      {/* Cycle Status Alert */}
      {!cycleStarted && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="bold">
            This review cycle has not started yet.
          </Typography>
          <Typography variant="body2">
            Feedback can only be submitted starting from{' '}
            <strong>{new Date(assignment.reviewCycle.startDate).toLocaleDateString()}</strong>.
          </Typography>
        </Alert>
      )}

      {cycleEnded && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="bold">
            This review cycle has ended.
          </Typography>
          <Typography variant="body2">
            The cycle ended on{' '}
            <strong>{new Date(assignment.reviewCycle.endDate).toLocaleDateString()}</strong>.
            Feedback submission is no longer available.
          </Typography>
        </Alert>
      )}

      {/* Assignment Info */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ width: 48, height: 48, mr: 2 }}>
            {assignment.reviewee.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">
              Providing feedback for: {assignment.reviewee.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {assignment.reviewCycle.name}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Chip
            label={assignment.relationType}
            color={getRelationTypeColor(assignment.relationType)}
          />
          <Chip
            label={`Due: ${new Date(assignment.reviewCycle.endDate).toLocaleDateString()}`}
            variant="outlined"
          />
        </Box>
      </Paper>

      {/* Progress Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {categories.map((category, index) => (
          <Step key={category}>
            <StepLabel>{category}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Current Category Questions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {currentCategory} - Questions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please rate each statement on a scale of 1-5, where 1 = Strongly Disagree and 5 = Strongly Agree
          </Typography>

          {currentCategoryQuestions.map((question: Question, index: number) => (
            <Box key={question.id} sx={{ mb: 4 }}>
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                {index + 1}. {question.text}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Rate this statement:
                </Typography>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap={0.5}
                  sx={{ 
                    cursor: cycleStarted && !cycleEnded ? 'pointer' : 'not-allowed',
                    opacity: cycleStarted && !cycleEnded ? 1 : 0.5,
                    '&:hover .star': cycleStarted && !cycleEnded ? {
                      transform: 'scale(1.1)',
                      transition: 'transform 0.2s ease'
                    } : {}
                  }}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isSelected = feedbackData[question.id]?.score >= star;
                    return (
                      <Box
                        key={star}
                        className="star"
                        onClick={() => {
                          if (cycleStarted && !cycleEnded) {
                            handleScoreChange(question.id, star);
                          }
                        }}
                        sx={{
                          cursor: cycleStarted && !cycleEnded ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s ease',
                          '&:hover': cycleStarted && !cycleEnded ? {
                            transform: 'scale(1.2)'
                          } : {}
                        }}
                      >
                        {isSelected ? (
                          <Star 
                            sx={{ 
                              fontSize: 32,
                              color: '#FFD700',
                              filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3))'
                            }} 
                          />
                        ) : (
                          <StarBorder 
                            sx={{ 
                              fontSize: 32,
                              color: '#E0E0E0',
                              '&:hover': {
                                color: '#FFD700'
                              }
                            }} 
                          />
                        )}
                      </Box>
                    );
                  })}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      ml: 2, 
                      fontWeight: 500,
                      color: feedbackData[question.id]?.score ? 'primary.main' : 'text.secondary'
                    }}
                  >
                    {feedbackData[question.id]?.score ? `${feedbackData[question.id].score}/5` : 'Select rating'}
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1,
                    color: 'text.secondary',
                    fontStyle: 'italic'
                  }}
                >
                  {feedbackData[question.id]?.score === 1 && '⭐ Strongly Disagree'}
                  {feedbackData[question.id]?.score === 2 && '⭐⭐ Disagree'}
                  {feedbackData[question.id]?.score === 3 && '⭐⭐⭐ Neutral'}
                  {feedbackData[question.id]?.score === 4 && '⭐⭐⭐⭐ Agree'}
                  {feedbackData[question.id]?.score === 5 && '⭐⭐⭐⭐⭐ Strongly Agree'}
                  {!feedbackData[question.id]?.score && 'Click on a star to rate'}
                </Typography>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Additional Comments (Optional)"
                value={feedbackData[question.id]?.comment || ''}
                onChange={(e) => {
                  if (cycleStarted && !cycleEnded) {
                    handleCommentChange(question.id, e.target.value);
                  }
                }}
                placeholder="Provide specific examples or additional feedback..."
                disabled={!cycleStarted || cycleEnded}
              />

              {index < currentCategoryQuestions.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<ArrowBack />}
        >
          Previous
        </Button>
        
        <Button
          variant="contained"
          onClick={activeStep === categories.length - 1 ? handleSubmitAll : handleNextCategory}
          disabled={!isCurrentCategoryComplete() || submitMutation.isLoading || !cycleStarted || cycleEnded}
          endIcon={<ArrowForward />}
        >
          {activeStep === categories.length - 1 ? 'Submit All' : 'Next Category'}
        </Button>
      </Box>
    </Box>
  );
};

export default FeedbackForm;

