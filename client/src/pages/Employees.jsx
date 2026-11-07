import { useEffect, useState, useCallback } from "react";
import { Card, Button, Grid, Alert, Skeleton } from "@mui/material";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { useToast } from "../components/common/Toast";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import PasswordConfirmDialog from "../components/common/PasswordConfirmDialog";
import EmployeeCard from "../components/employees/EmployeeCard";
import EmployeeFormDialog from "../components/employees/EmployeeFormDialog";

export default function Employees() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === "admin";

  const [employees, setEmployees] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(() => {
    api("/api/employees")
      .then(setEmployees)
      .catch((e) => toast(e.message, "error"));
  }, [toast]);
  useEffect(load, [load]);

  const remove = async () => {
    await api(`/api/employees/${toDelete.id}`, { method: "DELETE" });
    toast("Employee deleted");
    setToDelete(null);
    load();
  };

  return (
    <>
      <PageHeader
        title="Employees"
        subtitle="People who can sign in to the system."
        action={
          isAdmin && (
            <Button
              variant="contained"
              startIcon={<PersonAddRoundedIcon />}
              onClick={() => setAddOpen(true)}
            >
              Add employee
            </Button>
          )
        }
      />
      {!isAdmin && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Only admins can add or remove employees.
        </Alert>
      )}

      {!employees && (
        <Grid container spacing={2.5}>
          {[0, 1, 2].map((i) => (
            <Grid item xs={12} sm={6} lg={4} key={i}>
              <Card>
                <Skeleton height={96} />
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {employees && employees.length === 0 && (
        <Card>
          <EmptyState icon={<BadgeRoundedIcon />} title="No employees found" />
        </Card>
      )}
      {employees && employees.length > 0 && (
        <Grid container spacing={2.5}>
          {employees.map((e) => (
            <Grid item xs={12} sm={6} lg={4} key={e.id}>
              <EmployeeCard
                employee={e}
                canDelete={isAdmin}
                onDelete={setToDelete}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <EmployeeFormDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={(msg) => {
          toast(msg);
          setAddOpen(false);
          load();
        }}
      />

      <PasswordConfirmDialog
        open={!!toDelete}
        color="error"
        title="Delete employee"
        description={`Enter your password to delete "${toDelete?.name}". This cannot be undone.`}
        confirmLabel="Delete"
        onClose={() => setToDelete(null)}
        onConfirmed={remove}
      />
    </>
  );
}
