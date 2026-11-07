import { Grid, Card, Skeleton, CardContent } from "@mui/material";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import MedicineCard from "./MedicineCard";
import EmptyState from "../common/EmptyState";

export default function MedicineGrid({ medicines, onEdit, onDelete }) {
  if (!medicines) {
    return (
      <Grid container spacing={2.5}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Grid item xs={12} sm={6} lg={4} key={i}>
            <Card>
              <CardContent>
                <Skeleton height={28} />
                <Skeleton height={80} />
                <Skeleton height={50} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }
  if (medicines.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<MedicationRoundedIcon />}
          title="No medicines found"
          hint="Try a different search or add a new medicine."
        />
      </Card>
    );
  }
  return (
    <Grid container spacing={2.5}>
      {medicines.map((m) => (
        <Grid item xs={12} sm={6} lg={4} key={m.id}>
          <MedicineCard medicine={m} onEdit={onEdit} onDelete={onDelete} />
        </Grid>
      ))}
    </Grid>
  );
}
