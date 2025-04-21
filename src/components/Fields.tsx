import React from "react";
import { Paragraph } from "@contentful/f36-components";
import { FieldExtensionSDK } from "@contentful/app-sdk";

interface FieldProps {
  sdk: FieldExtensionSDK;
}

export default function Field() {
  return <Paragraph>HELLO DEMO</Paragraph>;
}
