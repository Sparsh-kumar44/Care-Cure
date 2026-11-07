import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Grid, Card, Box, Typography, Button, Alert } from "@mui/material";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { api, money } from "../api";
import { useAuth } from "../AuthContext";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import EmptyState from "../components/common/EmptyState";
import MedicineCard from "../components/medicines/MedicineCard";

const noop = () => {};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/dashboard")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  const loading = !data;
  const d = data || {};

  const stats = [
    {
      label: "Today's Revenue",
      value: money(d.todaysRevenue),
      icon: <PaymentsRoundedIcon />,
      color: "success",
    },
    {
      label: "Bills Today",
      value: d.todaysBillCount,
      icon: <ReceiptLongRoundedIcon />,
      color: "secondary",
    },
    {
      label: "Total Medicines",
      value: d.totalMeds,
      icon: <MedicationRoundedIcon />,
      color: "primary",
    },
    {
      label: "Expiring in 30 days",
      value: d.expiringSoon,
      icon: <ScheduleRoundedIcon />,
      color: "warning",
    },
    {
      label: "Expired Medicines",
      value: d.expiredMeds,
      icon: <EventBusyRoundedIcon />,
      color: "error",
    },
    {
      label: "Employees",
      value: d.totalEmployees,
      icon: <BadgeRoundedIcon />,
      color: "primary",
    },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name || ""} `}
        subtitle="Here is what's happening at the clinic today."
        action={
          <Button
            component={RouterLink}
            to="/billing"
            variant="contained"
            size="large"
            startIcon={<AddRoundedIcon />}
          >
            New Bill
          </Button>
        }
      />
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {stats.map((s) => (
          <Grid item xs={12} sm={6} lg={4} key={s.label}>
            <StatCard {...s} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Recently added medicines</Typography>
        <Button component={RouterLink} to="/medicines" size="small">
          View all
        </Button>
      </Box>

      {!loading && d.recentMedicines.length === 0 && (
        <Card>
          <EmptyState
            icon={<MedicationRoundedIcon />}
            title="No medicines found"
          />
        </Card>
      )}
      <Grid container spacing={2.5}>
        {!loading &&
          d.recentMedicines.map((m) => (
            <Grid item xs={12} sm={6} lg={4} key={m.id}>
              <MedicineCard
                medicine={m}
                onEdit={noop}
                onDelete={noop}
                readOnly
              />
            </Grid>
          ))}
      </Grid>
    </>
  );
}
