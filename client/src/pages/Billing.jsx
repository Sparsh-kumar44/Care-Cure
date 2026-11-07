import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Autocomplete,
  IconButton,
  Alert,
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import { api, money } from "../api";
import { useToast } from "../components/common/Toast";
import PageHeader from "../components/common/PageHeader";

let rowSeq = 0;
const newRow = () => ({ key: ++rowSeq, med: null, tablets: "" });
const totalTabs = (m) => Math.round(m.strips * m.tabletsPerStrip);
const perTab = (m) => m.price / m.tabletsPerStrip;

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export default function Billing() {
  const toast = useToast();
  const now = useClock();
  const [medicines, setMedicines] = useState([]);
  const [patient, setPatient] = useState({
    name: "",
    age: "",
    phone: "",
    gender: "",
  });
  const [rows, setRows] = useState([newRow()]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    api("/api/medicines")
      .then(setMedicines)
      .catch(() => setError("Failed to load medicines. Please refresh."));
  useEffect(() => {
    load();
  }, []);

  const updateRow = (key, patch) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const removeRow = (key) =>
    setRows((rs) =>
      rs.length === 1 ? [newRow()] : rs.filter((r) => r.key !== key),
    );

  const lines = useMemo(
    () =>
      rows.map((r) => {
        const qty = Number(r.tablets) || 0;
        if (!r.med) return { ...r, qty, amount: 0, insufficient: false };
        const insufficient = qty > totalTabs(r.med);
        return {
          ...r,
          qty,
          amount: insufficient ? 0 : qty * perTab(r.med),
          insufficient,
        };
      }),
    [rows],
  );

  const hasInsufficient = lines.some((l) => l.insufficient);
  const grand = lines.reduce((s, l) => s + l.amount, 0);
  const pickedIds = new Set(rows.filter((r) => r.med).map((r) => r.med.id));

  const generate = async () => {
    setError("");
    if (!patient.name.trim() || !patient.age)
      return setError("Please fill patient name and age.");
    const items = lines.filter((l) => l.med && l.qty > 0);
    if (items.length === 0)
      return setError("Please add at least one medicine with a quantity.");
    const bad = items.find((l) => l.insufficient);
    if (bad)
      return setError(
        `Not enough tablets for "${bad.med.name}". Available: ${totalTabs(bad.med)}`,
      );

    setBusy(true);
    try {
      const data = await api("/api/bills", {
        method: "POST",
        body: {
          patientName: patient.name.trim(),
          patientAge: patient.age,
          patientPhone: patient.phone.trim(),
          patientGender: patient.gender,
          items: items.map((l) => ({ medicineId: l.med.id, tablets: l.qty })),
        },
      });
      toast(`Bill #${data.billNo} generated`);
      window.open(`/print-bill/${data.billId}`, "_blank");
      setPatient({ name: "", age: "", phone: "", gender: "" });
      setRows([newRow()]);
      load();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <>
      <PageHeader
        title="Bill Generator"
        subtitle="Create a bill and print it for the patient."
        action={
          <Chip
            sx={{ height: 36, fontWeight: 600, px: 0.5 }}
            label={`${now.toLocaleDateString("en-GB")}  ·  ${now.toLocaleTimeString("en-GB")}`}
          />
        }
      />
      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}
            >
              <PersonRoundedIcon color="primary" />
              <Typography variant="h6">Patient details</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Patient name"
                  required
                  value={patient.name}
                  onChange={(e) =>
                    setPatient({ ...patient, name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Age"
                  type="number"
                  required
                  inputProps={{ min: 1, max: 120 }}
                  value={patient.age}
                  onChange={(e) =>
                    setPatient({ ...patient, age: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone (optional)"
                  value={patient.phone}
                  onChange={(e) =>
                    setPatient({ ...patient, phone: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Gender (optional)"
                  value={patient.gender}
                  onChange={(e) =>
                    setPatient({ ...patient, gender: e.target.value })
                  }
                >
                  <MenuItem value="">—</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Card>

          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <MedicationRoundedIcon color="primary" />
                <Typography variant="h6">Medicines</Typography>
              </Box>
              <Button
                startIcon={<AddRoundedIcon />}
                onClick={() => setRows([...rows, newRow()])}
              >
                Add medicine
              </Button>
            </Box>

            <Stack spacing={2}>
              {lines.map((l) => (
                <Box
                  key={l.key}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: l.insufficient ? "error.main" : "divider",
                    borderRadius: 3,
                    bgcolor: "action.hover",
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                      <Autocomplete
                        options={medicines}
                        value={l.med}
                        onChange={(_, v) => updateRow(l.key, { med: v })}
                        getOptionLabel={(m) => m.name}
                        getOptionDisabled={(m) =>
                          pickedIds.has(m.id) && l.med?.id !== m.id
                        }
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        noOptionsText="No medicines found"
                        renderOption={(props, m) => (
                          <li {...props} key={m.id}>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {m.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {totalTabs(m)} tablets · ₹{perTab(m).toFixed(2)}
                                /tablet
                              </Typography>
                            </Box>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Medicine"
                            placeholder="Search…"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={5} md={2}>
                      <TextField
                        label="Tablets"
                        type="number"
                        inputProps={{ min: 1 }}
                        value={l.tablets}
                        error={l.insufficient}
                        onChange={(e) =>
                          updateRow(l.key, { tablets: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid item xs={7} md={4}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            {l.med
                              ? `${totalTabs(l.med)} in stock`
                              : "Select a medicine"}
                          </Typography>
                          <Typography
                            fontWeight={700}
                            color={l.insufficient ? "error" : "text.primary"}
                          >
                            {l.insufficient
                              ? "Insufficient stock"
                              : l.amount
                                ? money(l.amount)
                                : "—"}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => removeRow(l.key)}
                          aria-label="Remove row"
                        >
                          <CloseRoundedIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 3, position: { lg: "sticky" }, top: { lg: 24 } }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Summary
            </Typography>
            <Stack spacing={1.2} sx={{ mb: 2 }}>
              {lines
                .filter((l) => l.med && l.qty > 0 && !l.insufficient)
                .map((l) => (
                  <Box
                    key={l.key}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {l.med.name} × {l.qty}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {money(l.amount)}
                    </Typography>
                  </Box>
                ))}
              {lines.every((l) => !l.med || !l.qty) && (
                <Typography variant="body2" color="text.secondary">
                  No items added yet.
                </Typography>
              )}
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                mb: 3,
              }}
            >
              <Typography color="text.secondary">Grand total</Typography>
              <Typography variant="h4" color="primary.dark">
                {hasInsufficient ? "—" : money(grand)}
              </Typography>
            </Box>
            <Button
              fullWidth
              size="large"
              variant="contained"
              startIcon={<PrintRoundedIcon />}
              onClick={generate}
              disabled={busy || hasInsufficient}
              sx={{ py: 1.4 }}
            >
              {busy ? "Generating…" : "Generate & print bill"}
            </Button>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
