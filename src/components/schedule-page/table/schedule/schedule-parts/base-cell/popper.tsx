/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { DividerProps } from "@material-ui/core";
import React, { RefObject } from "react";
import { ReactNode } from "react";

type PopperArguments = { isOpen: boolean; data: ReactNode } & PopperOptions;
export type PopperOptions = Omit<DividerProps, "ref"> & {
  ref?: RefObject<HTMLDivElement>;
};

export function Popper(props: PopperArguments): JSX.Element {
  return (
    <div ref={props.ref}>{props.isOpen && <div className={props.className}>{props.data}</div>}</div>
  );
}