import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Paginator } from 'primereact/paginator';
import { Link } from 'react-router-dom';
import { Divider } from 'primereact/divider';

type TimeType = 'past' | 'future' | 'now';
const start = new Date();
const end = new Date(start.setHours(start.getHours() + 1));
start.setHours(start.getHours() - 2);

const tags = {
  future: <Tag>Future</Tag>,
  past: <Tag pt={{ root: { style: { backgroundColor: '#64748b' } } }}>Past</Tag>,
  now: <Tag severity={'success'}>Now</Tag>,
};

const reservationMockData = {
  now: [
    {
      name: 'Robolab O105',
      start: new Date(start),
      end: new Date(end),
    },
  ],
  future: [
    {
      name: 'Office gym',
      start: new Date(start.setDate(start.getDate() + 1)),
      end: new Date(end.setDate(end.getDate() + 1)),
    },
    {
      name: 'Robolab O105',
      start: new Date(start.setDate(start.getDate() + 1)),
      end: new Date(end.setDate(end.getDate() + 1)),
    },
    {
      name: '3D Printer',
      start: new Date(start.setDate(start.getDate() + 1)),
      end: new Date(end.setDate(end.getDate() + 1)),
    },
    {
      name: 'Office gym',
      start: new Date(start.setDate(start.getDate() + 1)),
      end: new Date(end.setDate(end.getDate() + 1)),
    },
  ],
  past: [
    {
      name: 'Office gym',
      start: new Date(start.setDate(start.getDate() - 4)),
      end: new Date(end.setDate(end.getDate() - 4)),
    },
    {
      name: 'Robolab O105',
      start: new Date(start.setDate(start.getDate() - 1)),
      end: new Date(end.setDate(end.getDate() - 1)),
    },
    {
      name: '3D Printer',
      start: new Date(start.setDate(start.getDate() - 1)),
      end: new Date(end.setDate(end.getDate() - 1)),
    },
    {
      name: 'Office gym',
      start: new Date(start.setDate(start.getDate() - 1)),
      end: new Date(end.setDate(end.getDate() - 1)),
    },
  ],
};

export const ReservationList = () => {
  return (
    <>
      <h2>My reservations</h2>
      <Divider />
      <div className="flex gap-5 flex-column">
        {Object.entries(reservationMockData).map(([key, val], index) => (
          <>
            <div className="flex flex-wrap">
              {val.map((res, index) => (
                <div className="p-2 w-full md:w-6">
                  <Link to={'/reserve/0'} className="no-underline">
                    <Card
                      key={`reservation-${index}`}
                      title={res.name}
                      header={tags[key as TimeType]}
                      subTitle={`${res.start.toLocaleDateString()} ${res.start.toLocaleTimeString()} - ${res.end.toLocaleDateString()} ${res.end.toLocaleTimeString()}`}
                      pt={{
                        header: { className: 'flex justify-content-end' },
                      }}
                      className={'w-full'}
                    />
                  </Link>
                </div>
              ))}
            </div>
            {key !== 'now' && (
              <Paginator
                first={0}
                rows={1}
                totalRecords={index * 2}
                onPageChange={() => {}}
                pt={{ root: { className: 'surface-ground justify-content-end' } }}
              />
            )}
          </>
        ))}
      </div>
    </>
  );
};
