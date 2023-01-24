import Layout from '@/components/Layout';
import ListingForm from '@/components/ListingForm';

const Edit = () => {
    return (
        <Layout>
            <div className="max-w-screen-sm mx-auto">
                <h1 className="text-xl font-medium text-gray-800">Edit your home</h1>
                <p className="text-gray-500">
                    Fill out the form below to update your home.
                </p>
                <div className="mt-8">
                    <ListingForm buttonText="Update home" />
                </div>
            </div>
        </Layout>
    );
};

export default Edit;