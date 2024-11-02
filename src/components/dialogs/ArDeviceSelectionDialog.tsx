import useStore from 'Store';
import styled from 'styled-components';
import { useZakeke } from '@zakeke/zakeke-configurator-react';
import { Dialog, useDialogManager } from './Dialogs';
import QRCode from 'qrcode.react';

import deviceAndroid from '../../assets/images/device_android.png';
import deviceIOS from '../../assets/images/device_ios.png';

const DeviceSelectionsContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: start;
	justify-content: center;
	height: 320px;
	padding: 30px;
`;

const DeviceSelectionsTitle = styled.span`
	font-size: 22px;
	margin-bottom: 20px;
	font-weight: bold;
`;

const DeviceSelections = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 40px;
	height: 200px;
	justify-content: center;
	align-items: center;

	img {
		background-color: #f3f5f6;
		width: 100%;
		height: 200px;
		object-fit: contain;
		padding: 30px 40px;
		border-radius: 10px;
		cursor: pointer;

		&:hover {
			box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.15);
		}
	}
`;

const QRCodeContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	padding: 20px 40px;

	span {
		size: 20px;
		text-align: center;
		&:first-of-type {
			margin-top: 20px;
		}
	}
`;

const ArDeviceSelectionDialog = () => {
	const { setIsLoading } = useStore();
	const { showDialog, closeDialog } = useDialogManager();
	const { getQrCodeArUrl } = useZakeke();

	const showQrCode = async (type: 'iOS' | 'Android') => {
		setIsLoading(true);
		const url = await getQrCodeArUrl(type);
		setIsLoading(false);

		showDialog(
			'qr',
			<Dialog>
				<QRCodeContainer>
					<h2>Scan the QR code with your phone</h2>
					<QRCode value={url} size={200} />
					<span> iOS 15+, iPadOS 15+ </span>
					<span>or Android with ARCore 1.9+ required </span>
				</QRCodeContainer>
			</Dialog>
		);
	};

	return (
		<Dialog>
			<DeviceSelectionsContainer>
				<DeviceSelectionsTitle>Choose your device</DeviceSelectionsTitle>
				<DeviceSelections>
					<img
						src={deviceAndroid}
						alt='android'
						onClick={() => {
							closeDialog('select-ar');
							showQrCode('Android');
						}}
					/>
					<img
						src={deviceIOS}
						alt='ios'
						onClick={() => {
							closeDialog('select-ar');
							showQrCode('iOS');
						}}
					/>
				</DeviceSelections>
			</DeviceSelectionsContainer>
		</Dialog>
	);
};

export default ArDeviceSelectionDialog;
