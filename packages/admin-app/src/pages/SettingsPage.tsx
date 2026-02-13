import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
} from '@mui/material';
import { beauticiansApi } from '../api/client';

const DAY_NAMES = ['Pondeli', 'Utery', 'Streda', 'Ctvrtek', 'Patek', 'Sobota', 'Nedele'];

const SettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [workingHours, setWorkingHours] = useState<any[]>([]);
  const [selectedSalon, setSelectedSalon] = useState('');

  useEffect(() => {
    beauticiansApi.me().then((data) => {
      setProfile(data);
      if (data.salons?.length > 0) {
        setSelectedSalon(data.salons[0].salonId);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (profile?.id && selectedSalon) {
      beauticiansApi
        .getWorkingHours(profile.id, selectedSalon)
        .then(setWorkingHours)
        .catch(() => setWorkingHours([]));
    }
  }, [profile?.id, selectedSalon]);

  const handleSaveHours = async (dayOfWeek: number, startTime: string, endTime: string) => {
    if (!profile?.id || !selectedSalon) return;
    await beauticiansApi.setWorkingHours({
      beauticianId: profile.id,
      salonId: selectedSalon,
      dayOfWeek,
      startTime,
      endTime,
    });
    beauticiansApi.getWorkingHours(profile.id, selectedSalon).then(setWorkingHours);
  };

  if (!profile) {
    return <Typography>Nacitani profilu...</Typography>;
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Nastaveni
      </Typography>

      {/* Profile */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              {profile.firstName?.[0]}{profile.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile.email}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2">{profile.bio || 'Zadny popis'}</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Salony ({profile.salons?.length || 0})
          </Typography>
          {profile.salons?.map((s: any) => (
            <Typography key={s.salonId} variant="body2">
              {s.salon?.name} ({s.role === 'owner' ? 'Vlastnik' : 'Zamestnanec'})
            </Typography>
          ))}
          {profile.team?.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Tym ({profile.team.length})
              </Typography>
              {profile.team.map((t: any) => (
                <Typography key={t.id} variant="body2">
                  {t.firstName} {t.lastName}
                </Typography>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {/* Working hours */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pracovni doba
          </Typography>

          {profile.salons?.length > 1 && (
            <FormControl size="small" sx={{ mb: 2, minWidth: 200 }}>
              <InputLabel>Salon</InputLabel>
              <Select
                value={selectedSalon}
                label="Salon"
                onChange={(e) => setSelectedSalon(e.target.value)}
              >
                {profile.salons.map((s: any) => (
                  <MenuItem key={s.salonId} value={s.salonId}>
                    {s.salon?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Den</TableCell>
                  <TableCell>Od</TableCell>
                  <TableCell>Do</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DAY_NAMES.map((name, idx) => {
                  const hours = workingHours.find((h) => h.dayOfWeek === idx);
                  return (
                    <WorkingHoursRow
                      key={idx}
                      dayName={name}
                      dayOfWeek={idx}
                      startTime={hours?.startTime || ''}
                      endTime={hours?.endTime || ''}
                      onSave={handleSaveHours}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </>
  );
};

const WorkingHoursRow: React.FC<{
  dayName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  onSave: (day: number, start: string, end: string) => void;
}> = ({ dayName, dayOfWeek, startTime: initStart, endTime: initEnd, onSave }) => {
  const [start, setStart] = useState(initStart);
  const [end, setEnd] = useState(initEnd);

  useEffect(() => {
    setStart(initStart);
    setEnd(initEnd);
  }, [initStart, initEnd]);

  return (
    <TableRow>
      <TableCell>{dayName}</TableCell>
      <TableCell>
        <TextField
          size="small"
          type="time"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          sx={{ width: 130 }}
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          type="time"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          sx={{ width: 130 }}
        />
      </TableCell>
      <TableCell>
        <Button
          size="small"
          variant="outlined"
          disabled={!start || !end}
          onClick={() => onSave(dayOfWeek, start, end)}
        >
          Ulozit
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default SettingsPage;
