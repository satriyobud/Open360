import React, { useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Dialog, DialogTitle, DialogContent, Chip } from '@mui/material';
import { useQuery } from 'react-query';
import { api } from '../../services/api.ts';

const FeedbackSummaries: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<any | null>(null);

  const { data: pairs = [] } = useQuery('report-pairs', async () => {
    const res = await api.get('/reports/pairs');
    return res.data as any[];
  });

  const { data: categories = [], refetch } = useQuery(['pair-categories', selectedPair?.reviewer?.id, selectedPair?.reviewee?.id], async () => {
    if (!selectedPair) return [];
    const res = await api.get(`/reports/pair-categories?reviewerId=${selectedPair.reviewer.id}&revieweeId=${selectedPair.reviewee.id}`);
    return res.data as any[];
  }, { enabled: !!selectedPair });

  const openPair = (pair: any) => {
    setSelectedPair(pair);
    setTimeout(() => refetch(), 0);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Feedback Summaries</Typography>

      <Grid container spacing={2}>
        {pairs.map((p: any, idx: number) => (
          <Grid item xs={12} sm={6} md={4} key={`${p.reviewer.id}-${p.reviewee.id}-${idx}`}>
            <Card onClick={() => openPair(p)} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Reviewer</Typography>
                <Typography variant="h6" gutterBottom>{p.reviewer.name}</Typography>
                <Typography variant="subtitle2" color="text.secondary">Reviewee</Typography>
                <Typography variant="h6">{p.reviewee.name}</Typography>
                <Box mt={2} display="flex" gap={2} alignItems="center">
                  <Chip label={`Avg ${Number(p.averageScore).toFixed(2)}`} color="primary" size="small" />
                  <Chip label={`${p.totalFeedbacks} responses`} size="small" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!selectedPair} onClose={() => setSelectedPair(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPair ? `${selectedPair.reviewer.name} → ${selectedPair.reviewee.name}` : 'Summary'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={1}>
            {categories.map((c: any) => (
              <Box key={c.category.id} display="flex" justifyContent="space-between" alignItems="center" py={1} sx={{ borderBottom: '1px solid #eee' }}>
                <Typography>{c.category.name}</Typography>
                <Chip label={`${Number(c.averageScore).toFixed(2)} / 5`} color="success" size="small" />
              </Box>
            ))}
            {categories.length === 0 && (
              <Typography color="text.secondary">No data.</Typography>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FeedbackSummaries;


