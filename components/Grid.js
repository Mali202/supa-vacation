import PropTypes from 'prop-types';
import Card from '@/components/Card';
import { ExclamationIcon } from '@heroicons/react/outline';
import {useState, useEffect} from "react";
import axios from 'axios';
import toast from 'react-hot-toast';
import {useSession} from "next-auth/react";

const Grid = ({ homes = [] }) => {
  const { status } = useSession();
  const [favourites, setFavourites] = useState([]);
  useEffect(() => {
    if (status === "authenticated") {
      axios.get("api/user/favourites").then(res => setFavourites(res.data));
    }
  }, [status])
  const isEmpty = homes.length === 0;

  const toggleFavorite = async id => {
    if (status !== "authenticated") {
      toast.error("Login to add favourites")
      return;
    }

    let toastId;
    if (!favourites.find(home => home.id === id)) {
      toastId = toast.loading("Adding to favourites");
      try {
        await axios.put(`api/homes/${id}/favourite`);
        toast.success("Home added to favourites", {id: toastId})
      } catch (e) {
        toast.error("Could not add to favourites ", {id: toastId});
      }
    } else {
      toastId = toast.loading("Removing from favourites");
      try {
        await axios.delete(`api/homes/${id}/favourite`);
        toast.success("Home removed from favourites", {id: toastId})
      } catch (e) {
        toast.error("Could not remove from favourites", {id: toastId});
      }
    }
    axios.get("api/user/favourites").then(res => setFavourites(res.data));
  };

  return isEmpty ? (
    <p className="text-amber-700 bg-amber-100 px-4 rounded-md py-2 max-w-max inline-flex items-center space-x-1">
      <ExclamationIcon className="shrink-0 w-5 h-5 mt-px" />
      <span>Unfortunately, there is nothing to display yet.</span>
    </p>
  ) : (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {homes.map(home => (
        <Card
            key={home.id}
            {...home}
            onClickFavorite={toggleFavorite}
            favorite={favourites.find(fHome => fHome.id === home.id)}
        />
      ))}
    </div>
  );
};

Grid.propTypes = {
  homes: PropTypes.array,
};

export default Grid;
