import React, { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';

interface ILocation {
  readonly latitude: number;
  readonly longitude: number;
  readonly state: string;
  readonly city: string;
  readonly zip?: undefined;
}

interface ITruck {
  readonly id: string;
  readonly location: ILocation;
  readonly active: boolean;
}

export function App(): JSX.Element {

  const [trucks, setTrucks] = useState<ITruck[] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(
    (): void => {

      async function getTrucks(): Promise<void> {

        const response: AxiosResponse<ITruck[]> = await axios.get<ITruck[]>('https://s3.amazonaws.com/interview.aifleet.dev/trucks.json')

        setTrucks(response.data)
      }

      if (!trucks) {
        getTrucks()
      }
    },
    [trucks]
  )

  function getLocationOfActiveTrucks(): string[] {

    return trucks?.filter((truck: ITruck): boolean => truck.active).map((truck: ITruck): string => formatLocation(truck)) || []
  }

  function formatLocation(truck: ITruck): string {

    return `${truck.location.city}${truck.location.zip ? ` ${truck.location.zip}` : ''}, ${truck.location.state}`
  }

  function getSelected(): ITruck | undefined {

    return trucks?.find((truck: ITruck): boolean => truck.id === selectedId)
  }

  function getSelectedString(): string {

    const selected: ITruck | undefined = getSelected()

    return `Selected truck's coordinates: ${selected?.location.latitude}, ${selected?.location.longitude}`
  }

  function onSelect(id: string): (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => void {

    return (event: React.MouseEvent<HTMLLIElement, MouseEvent>): void => {
      setSelectedId(id)
    }
  }

  return (
    <>
      {
        !!trucks && !!trucks.length
          ?
          <>
            <h1>List of the truck IDs</h1>
            <ul>
              {trucks.map((truck: ITruck): JSX.Element =>
                <li key={truck.id} onClick={onSelect(truck.id)}>
                  {truck.id}
                </li>
              )}
            </ul>
            {!!selectedId && <h2>{getSelectedString()}</h2>}
            <h2>Locations</h2>
            <ul>
              {getLocationOfActiveTrucks().map((locationString: string): JSX.Element =>
                <li key={locationString} >
                  {locationString}
                </li>
              )}
            </ul>
          </>
          :
          'Loading...'
      }
    </>
  );
}
