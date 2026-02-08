import React from "react";
import { styles } from "./style";
import { Document, Page, View, Text, PDFViewer } from "@react-pdf/renderer";
import { InternalRequisition } from "@/lib/internalRequestTypes";

function InvoicePdf({
  requisition,
}: {
  requisition: InternalRequisition | null;
}) {
  const InvoicePdfC = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text>Requisition Invoice</Text>
          </View>
          <View>
            <Text>Requisition Number: {requisition?.requisitionNumber}</Text>
          </View>
          <View>
            <Text>
              Requisition Date:{" "}
              {requisition?.requestedOn
                ? new Date(requisition.requestedOn).toLocaleDateString()
                : ""}
            </Text>
          </View>
          <View>
            <Text>Requisition Status: {requisition?.status}</Text>
          </View>
          <View>
            <Text>Requisition Amount: {requisition?.totalAmount}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
  return (
    <div className="w-full h-[500px]">
      <PDFViewer width="100%" height="100%">
        <InvoicePdfC />
      </PDFViewer>
    </div>
  );
}

export default InvoicePdf;
