import React, { useEffect, useState } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
} from '@mui/material';
import { CalendarMonth, People, Receipt, TrendingUp } from '@mui/icons-material';
import { bookingsApi, billingApi } from '../api/client';
import dayjs from 'dayjs';

const DashboardPage: React.FC = () => {
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = dayjs().format('YYYY-MM-DD');
    const monthStart = dayjs().startOf('month').format('YYYY-MM-DD');
    const monthEnd = dayjs().endOf('month').format('YYYY-MM-DD');

    Promise.all([
      bookingsApi.list({ dateFrom: today, dateTo: today + 'T23:59:59' }),
      billingApi.getSummary({ dateFrom: monthStart, dateTo: monthEnd }),
    ])
      .then(([bookings, billingSummary]) => {
        setTodayBookings(bookings);
        setSummary(billingSummary);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const stats = [
    {
      label: 'Dnesni rezervace',
      value: todayBookings.length,
      icon: <CalendarMonth sx={{ fontSize: 40, color: 'primary.light' }} />,
    },
    {
      label: 'Faktury tento mesic',
      value: summary?.invoiceCount || 0,
      icon: <Receipt sx={{ fontSize: 40, color: 'secondary.light' }} />,
    },
    {
      label: 'Trzby tento mesic',
      value: `${((summary?.totalRevenue || 0) / 100).toLocaleString('cs-CZ')} Kc`,
      icon: <TrendingUp sx={{ fontSize: 40, color: 'success.light' }} />,
    },
    {
      label: 'Nezaplaceno',
      value: summary?.unpaidCount || 0,
      icon: <Receipt sx={{ fontSize: 40, color: 'warning.light' }} />,
    },
  ];

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Prehled
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {stat.icon}
                <Box>
                  <Typography variant="h5">{stat.value}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" gutterBottom>
        Dnesni rezervace
      </Typography>
      {todayBookings.length === 0 ? (
        <Typography color="text.secondary">Zadne rezervace na dnes</Typography>
      ) : (
        <Grid container spacing={2}>
          {todayBookings.map((b) => (
            <Grid item xs={12} sm={6} md={4} key={b.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {dayjs(b.startTime).format('HH:mm')} - {dayjs(b.endTime).format('HH:mm')}
                  </Typography>
                  <Typography variant="body2">{b.customerName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {b.service?.name}
                  </Typography>
                  <Typography variant="caption" color={
                    b.status === 'confirmed' ? 'success.main' :
                    b.status === 'pending' ? 'warning.main' : 'text.secondary'
                  }>
                    {b.status === 'pending' ? 'Cekajici' :
                     b.status === 'confirmed' ? 'Potvrzeno' :
                     b.status === 'completed' ? 'Dokonceno' :
                     b.status === 'cancelled' ? 'Zruseno' : b.status}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default DashboardPage;
