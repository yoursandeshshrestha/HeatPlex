-- Add DELETE policies for staff to delete members, staff, and engineers

-- Members: Staff can delete
CREATE POLICY "Staff can delete members"
    ON members FOR DELETE
    USING (is_staff());

-- Staff: Staff can delete
CREATE POLICY "Staff can delete staff"
    ON staff FOR DELETE
    USING (is_staff());

-- Engineers: Staff can delete
CREATE POLICY "Staff can delete engineers"
    ON engineers FOR DELETE
    USING (is_staff());
