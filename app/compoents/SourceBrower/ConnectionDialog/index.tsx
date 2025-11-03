import React, { useState } from 'react';
import { Modal } from 'antd';
import type { ServiceConnection, ServiceType } from '../../../types/dataSource';
import WMSConnectionForm from './WMSConnectionForm';
import WMTSConnectionForm from './WMTSConnectionForm';
import XYZConnectionForm from './XYZConnectionForm';
import WFSConnectionForm from './WFSConnectionForm';
import ArcGISConnectionForm from './ArcGISConnectionForm';

interface ConnectionDialogProps {
  visible: boolean;
  connection?: ServiceConnection;
  onOk: (connection: ServiceConnection) => void;
  onCancel: () => void;
}

const ConnectionDialog: React.FC<ConnectionDialogProps> = ({
  visible,
  connection,
  onOk,
  onCancel,
}) => {
  const [currentType, setCurrentType] = useState<ServiceType>(
    connection?.type || 'wms'
  );
  const isEdit = !!connection;

  const handleOk = (conn: ServiceConnection) => {
    onOk(conn);
  };

  const handleCancel = () => {
    onCancel();
  };

  const renderForm = () => {
    const commonProps = {
      connection,
      onSubmit: handleOk,
      onCancel: handleCancel,
      onTypeChange: setCurrentType,
    };

    switch (currentType) {
      case 'wms':
        return <WMSConnectionForm {...commonProps} />;
      case 'wmts':
        return <WMTSConnectionForm {...commonProps} />;
      case 'xyz':
        return <XYZConnectionForm {...commonProps} />;
      case 'wfs':
        return <WFSConnectionForm {...commonProps} />;
      case 'arcgis':
        return <ArcGISConnectionForm {...commonProps} />;
      default:
        return <WMSConnectionForm {...commonProps} />;
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Connection' : 'New Connection'}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      {renderForm()}
    </Modal>
  );
};

export default ConnectionDialog;