// import { useForm } from "react-hook-form";
import {
  Button,
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
} from "@mui/material";
import { defaultValues, schema, Schema } from "../types/schema";
// import { zodResolver } from "@hookform/resolvers/zod";
import { RHFAutocomplete } from "../../components/RHFAutocomplete";
import { SubmitHandler, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Fragment, useEffect } from "react";
import {
  useGenders,
  useLanguages,
  useSkills,
  useStates,
  useUsers,
  useUser,
} from "../services/queries";
import { RHFToggleButtonGroup } from "../../components/RHFToggleButtonGroup";
import { RHFRadioGroup } from "../../components/RHFRadioGroup";
import { RHFCheckBox } from "../../components/RHFCheckBox";
import { RHFDateTimePicker } from "../../components/RHFDateTimePicker";
import { RHFDateRangePicker } from "../../components/RHFDateRangePicker";
import { RHFSlider } from "../../components/RHFSlider";
import { RHFSwitch } from "../../components/RHFSwitch";
import { RHFTextField } from "../../components/RHFTextField";
import { useCreateUser, useEditUser } from "../services/mutation";

export function Users() {
  const statesQuery = useStates();
  const languagesQuery = useLanguages();
  const gendersQuery = useGenders();
  const skillsQuery = useSkills();
  const usersQuery = useUsers();

  const {
    // register,
    watch,
    control,
    unregister,
    reset,
    setValue,
    handleSubmit,
    getValues,
  } = useFormContext<Schema>();

  const id = useWatch({ control, name: "id" });
  const variant = useWatch({control, name:'variant'})

  const userQuery = useUser(id);

  useEffect(() => {
    const sub = watch((value) => {
      console.log(value);
    });

    return () => sub.unsubscribe();
  }, [watch]);

  const isTeacher = useWatch({ control, name: "isTeacher" });

  const { append, fields, remove, replace } = useFieldArray({
    control,
    name: "students",
  });

  const handleUserClick = (id: string) => {
    setValue("id", id);
  };

  useEffect(() => {
    if (!isTeacher) {
      replace([]);
      unregister("students");
    }
  }, [isTeacher, replace, unregister]);

  useEffect(() => {
    if (userQuery.data) {
      reset(userQuery.data);
    }
  }, [reset, userQuery.data]);

  const handleReset = () => {
    reset(defaultValues);
  };

  //untuk menambahkan user baru
  const createUserMutation = useCreateUser();

  //untuk edit user
  const editUserMutation = useEditUser();

  const onSubmit: SubmitHandler<Schema> = (data) => {
    if(variant === 'create') {
      createUserMutation.mutate(data);
    } else {
      editUserMutation.mutate(data);
    }
  };

  return (
    <Container maxWidth="sm" component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack sx={{ flexDirection: "row", gap: 2 }}>
        <List subheader={<ListSubheader>Users</ListSubheader>}>
          {usersQuery.data?.map((user) => (
            <ListItem disablePadding key={user.id}>
              <ListItemButton
                onClick={() => handleUserClick(user.id)}
                selected={id === user.id}
              >
                <ListItemText primary={user.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Stack sx={{ gap: 2 }}>
          <RHFTextField<Schema> name="name" label="Name" />
          <RHFTextField<Schema> name="email" label="Email" />
          <RHFAutocomplete<Schema>
            name="states"
            label="States"
            options={statesQuery.data}
          />
          <RHFToggleButtonGroup<Schema>
            name="languagesSpoken"
            options={languagesQuery.data}
          />
          <RHFRadioGroup<Schema>
            name="gender"
            options={gendersQuery.data}
            label="Gender"
          />
          <RHFCheckBox<Schema>
            name="skills"
            options={skillsQuery.data}
            label="Skills"
          />
          <RHFDateTimePicker<Schema>
            name="registrationDateAndTime"
            label="Registration Date & Time"
          />
          <Typography>Former Employment Period:</Typography>
          <RHFDateRangePicker<Schema> name="formerEmploymentPeriod" />
          <RHFSlider<Schema> name="salaryRange" label="Salary Range" />
          <RHFSwitch<Schema> name="isTeacher" label="Are   you a teacher?" />

          {isTeacher && (
            <Button onClick={() => append({ name: "" })} type="button">
              Add new student
            </Button>
          )}

          {fields.map((field, index) => (
            <Fragment key={field.id}>
              <RHFTextField name={`students.${index}.name`} label="Name" />
              <Button color="error" onClick={() => remove(index)} type="button">
                Remove
              </Button>
            </Fragment>
          ))}
          <Stack sx={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Button variant="contained" type="submit">{ variant === 'create' ? 'New User' : 'Edit User'}</Button>
            <button onClick={() => schema.parse(getValues())} >parse</button>
            <Button onClick={handleReset}>Reset</Button>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}
