import React, { useState } from "react";
import { Modal, TextField } from "@material-ui/core";
import "./add-worker-modal.css";
import { WorkerTypeHelper } from "../../../state/models/schedule-data/employee-info.model";
import Button from "@material-ui/core/Button";

const initialState = {
  name: "",
  nameError: false,
  time: "",
  timeError: false,
};

const NAME_MIN_LENGTH = 5;

export function AddWorkerModal({ isOpened, setIsOpened, submit, workerType }) {
  const [{ name, nameError, time, timeError }, setState] = useState(initialState);

  const clearState = () => {
    setState({ ...initialState });
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState((prevState) => ({ ...prevState, [name]: value }));
  };

  const parseTimeIfPossible = (time) => {
    if (new RegExp("([0].[0-9])|(1.0)").test(time)) {
      return { isTimeFormatValid: true, parsedTime: Number(time) };
    }
    if (new RegExp("[1-9]/[0-9]").test(time)) {
      const timerArray = time.split("/");
      if (timerArray[0] <= timerArray[1]) {
        return { isTimeFormatValid: true, parsedTime: Number(timerArray[0] / timerArray[1]) };
      }
    }
    return { isTimeFormatValid: false, parsedTime: null };
  };

  const validateName = (name) => {
    return name.length >= NAME_MIN_LENGTH;
  };

  const handleSubmit = () => {
    const { isTimeFormatValid, parsedTime } = parseTimeIfPossible(time);
    const isNameValid = validateName(name);

    if (isTimeFormatValid) {
      setState((prevState) => ({ ...prevState, timeError: false }));
      if (isNameValid) {
        submit(name, parsedTime);
        handleClose();
      } else {
        setState((prevState) => ({ ...prevState, nameError: true }));
      }
    } else {
      setState((prevState) => ({ ...prevState, timeError: true }));
    }
  };

  const handleClose = () => {
    clearState();
    setIsOpened(false);
  };

  const body = (
    <div className="worker-modal">
      <h2 id="modal-title">
        Dodaj nowego pracownika do sekcji {WorkerTypeHelper.translate(workerType, true)}
      </h2>
      <form>
        <TextField
          id="name-input"
          label="Imię i nazwisko"
          value={name}
          name="name"
          onChange={onChange}
          required
          error={nameError}
          helperText={`Musi mieć co najmniej ${NAME_MIN_LENGTH} znaków`}
        />
        <TextField
          id="time-input"
          label="Etat"
          value={time}
          name={"time"}
          onChange={onChange}
          required
          helperText={"Obsługiwane formaty to: dziesiętny np. 0.1 i ułamkowy np. 3/5"}
          error={timeError}
        />
        <Button onClick={handleSubmit} className="add-worker-button" variant="outlined">
          Dodaj
        </Button>
      </form>
    </div>
  );

  return (
    <Modal open={isOpened} onClose={handleClose}>
      {body}
    </Modal>
  );
}