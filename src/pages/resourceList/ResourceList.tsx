import React from 'react';
import { Divider } from 'primereact/divider';
import { DataView } from 'primereact/dataview';
import { Button } from 'primereact/button';

const resourcesMockData = {
  MyResources: [
    {
      name: 'Robolab O105',
    },
    {
      name: '3D tiskárna',
    },
    {
      name: 'Posilovna v práci',
    },
  ],
};

interface ResourcePreview {
  id: number;
  name: string;
}

const itemTemplate = (item: ResourcePreview) => {
  return (
<div className="flex flex-row align-items-center justify-content-between p-3 mb-2 border-round-lg shadow-3 cursor-pointer" onClick={() => openResource(item.id)} >
  <div className="flex">
    <div className="mr-0 md:mr-8">
      <span className="block text-900 text-lg font-semibold mb-1">{item.name}</span>
    </div>
  </div>
  <div className="mt-0 flex flex-nowrap">
    <Button className="p-button p-button-text p-button-plain p-button-rounded mr-1 p-button-icon-only" onClick={() => copyLinkToResource(item.id)} icon="pi pi-link"></Button>
    <Button className="p-button p-button-text p-button-plain p-button-rounded mr-1 p-button-icon-only" onClick={() => editResource(item.id)} icon="pi pi-pencil"></Button>
    <Button className="p-button p-button-text p-button-plain p-button-rounded mr-1 p-button-icon-only" onClick={() => deleteResource(item.id)} icon="pi pi-trash"></Button>
  </div>
</div>);
};

const openResource = (id: number) => {
  console.log("Opening resource");
};

const copyLinkToResource = (id: number) => {
};

const editResource = (id: number) => {
};

const deleteResource = (id: number) => {
};

export const ResourceList = () => {
  return (
    <>
      <h2>Resource List</h2>
      <Divider />
      <DataView 
        value={resourcesMockData.MyResources}
        listTemplate={(items: ResourcePreview[]) => items.map(itemTemplate)}
      />
    </>
  );
};