import { useState } from 'react';
import React from 'react';
import { Divider } from 'primereact/divider';
import { DataView } from 'primereact/dataview';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import ShortUniqueId from 'short-unique-id';
import { Toast } from 'primereact/toast';

const uid = new ShortUniqueId({ length: 10 });

class ResourcePreview {
  id: string;
  name: string;
  description: string;

  constructor(name: string, description: string, id: string) {
    this.id = id;
    this.name = name;
    this.description = description;
  }

  equals(other: ResourcePreview) {
    return other instanceof ResourcePreview && this.id === other.id && this.name === other.name;
  }
}

export const ResourceList = () => {
  const toastRef = React.useRef<Toast>(null);
  const navigate = useNavigate();

  const openResource = (item: ResourcePreview) => {
    // Later route to specific reserve
    navigate(`/reserve/${item.id}`, { state: item });
  };

  const copyLinkToResource = (
    item: ResourcePreview,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    navigator.clipboard.writeText(`http://localhost:5173/reserve/${item.id}`);
    toastRef.current?.show({
      severity: 'success',
      summary: 'Copied to clipboard',
      detail: `Link to ${item.name} copied to clipboard.`,
    });
    event.stopPropagation();
  };

  const editResource = (
    item: ResourcePreview,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    // Later route to edit
    navigate(`/resource/${item.id}`, { state: item });
    event.stopPropagation();
  };

  const deleteResource = (id: string, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setResourcesMockData((prevResources) => prevResources.filter((resource) => resource.id !== id));
    event.stopPropagation();
  };

  const itemTemplate = (item: ResourcePreview) => {
    return (
      <div
        className="flex flex-row align-items-center justify-content-between p-3 mb-2 border-round-lg shadow-3 cursor-pointer"
        onClick={() => openResource(item)}
        key={`resource-${item.id}`}
      >
        <div className="flex">
          <div className="mr-0 md:mr-8">
            <span className="block text-900 text-lg font-semibold mb-1">{item.name}</span>
          </div>
        </div>
        <div className="mt-0 flex flex-nowrap">
          <Button
            className="p-button p-button-text p-button-plain p-button-rounded mr-1 p-button-icon-only"
            onClick={(e) => copyLinkToResource(item, e)}
            icon="pi pi-link"
          ></Button>
          <Button
            className="p-button p-button-text p-button-plain p-button-rounded mr-1 p-button-icon-only"
            onClick={(e) => editResource(item, e)}
            icon="pi pi-pencil"
          ></Button>
          <Button
            className="p-button p-button-text p-button-plain p-button-rounded mr-1 p-button-icon-only"
            onClick={(e) => deleteResource(item.id, e)}
            icon="pi pi-trash"
          ></Button>
        </div>
      </div>
    );
  };

  const [resourcesMockData, setResourcesMockData] = useState([
    new ResourcePreview('Robolab O105', 'dfgh f', uid.randomUUID()),
    new ResourcePreview('3D tiskárna', 'dfgh dfg', uid.randomUUID()),
    new ResourcePreview('Posilovna v práci', 'fgh fg', uid.randomUUID()),
  ]);

  return (
    <>
      <h2>Resource List</h2>
      <Divider />
      <DataView
        value={resourcesMockData}
        listTemplate={(items: ResourcePreview[]) => items.map(itemTemplate)}
      />
      <Toast ref={toastRef} position="bottom-right" />
    </>
  );
};
