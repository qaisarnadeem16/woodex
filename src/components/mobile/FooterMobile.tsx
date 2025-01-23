import { TryOnMode, useZakeke } from '@zakeke/zakeke-configurator-react';
import { T } from 'Helpers';
import useStore from 'Store';
import styled from 'styled-components';
import { ReactComponent as AngleLeftSolid } from '../../assets/icons/angle-left-solid.svg';
import { ReactComponent as QuoteSolid } from '../../assets/icons/quote-sign.svg';
import { ReactComponent as PdfSolid } from '../../assets/icons/file-pdf-solid.svg';
import { ReactComponent as ShareSolid } from '../../assets/icons/share-alt-square-solid.svg';
import { ReactComponent as CartSolid } from '../../assets/icons/shopping-cart-solid.svg';
import { MessageDialog, QuestionDialog, useDialogManager } from '../dialogs/Dialogs';
import ErrorDialog from '../dialogs/ErrorDialog';
import PdfDialog from '../dialogs/PdfDialog';
import ShareDialog from '../dialogs/ShareDialog';
import { FooterMobileContainer, PriceContainer } from '../layout/SharedComponents';

import QuotationFormDialog from 'components/dialogs/QuotationFormDialog';
import SaveDesignsDraftDialog from 'components/dialogs/SaveDesignsDraftDialog';
import { TailSpin } from 'react-loader-spinner';
import { ReactComponent as SaveSolid } from '../../assets/icons/save-solid.svg';
import NftDialog, { NftForm } from 'components/dialogs/NftDialog';
import { useEffect, useRef, useState } from 'react';
import useDropdown from 'hooks/useDropdown';
import { TooltipContent } from 'components/Atomic';
import QuantityDialog from 'components/dialogs/QuantityDialog';

const OutOfStockTooltipContent = styled(TooltipContent)`
	max-width: 400px;
`;

const FooterMobileIcon = styled.div<{
	isHidden?: boolean;
	color?: string;
	backgroundColor?: string;
	iconColor?: string;
	isCart?: boolean;
	disabled?: boolean;
	gridArea?: string;
}>`
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 70px;
	border: 1px transparent solid;
	color: ${(props) => (props.color ? props.color : `#313c46`)};
	background-color: ${(props) => (props.backgroundColor ? props.backgroundColor : `transparent`)};
	font-size: 14px;
	text-transform: uppercase;
	text-align: center;
	display: inline-flex;
	min-height: 38px;
	border: none;
	border-right: 3px #f4f4f4 solid;
	cursor: pointer;
	flex-direction: column;
	font-weight: bold !important;

	svg {
		fill: ${(props) => props.iconColor && `${props.iconColor}`};
		width: 32px;
		height: 32px;
	}

	${(props) => props.isHidden && `visibility:hidden`};

	${(props) =>
		props.isCart &&
		`
        display: flex;
        flex-direction: column-reverse;
        align-items: center;
        justify-content: center;`};

	${(props) =>
		props.disabled &&
		`
      background-color: lightgray;
      border: 1px solid gray;
      color: #313c46;
  `}
	${(props) => props.gridArea && `grid-area:${props.gridArea}`};
`;


const FooterMobileIcon2 = styled.div<{
	isHidden?: boolean;
	color?: string;
	backgroundColor?: string;
	iconColor?: string;
	isCart?: boolean;
	disabled?: boolean;
	gridArea?: string;
}>`
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 200px;
	border: 1px transparent solid;
	color: ${(props) => (props.color ? props.color : `#313c46`)};
	background-color: ${(props) => (props.backgroundColor ? props.backgroundColor : `transparent`)};
	font-size: 14px;
	text-transform: uppercase;
	text-align: center;
	display: inline-flex;
	min-height: 38px;
	border: none;
	border-right: 3px #f4f4f4 solid;
	cursor: pointer;
	flex-direction: column;
	font-weight: bold !important;

	svg {
		fill: ${(props) => props.iconColor && `${props.iconColor}`};
		width: 32px;
		height: 32px;
	}

	${(props) => props.isHidden && `visibility:hidden`};

	${(props) =>
		props.isCart &&
		`
        display: flex;
        flex-direction: column-reverse;
        align-items: center;
        justify-content: center;`};

	${(props) =>
		props.disabled &&
		`
      background-color: lightgray;
      border: 1px solid gray;
      color: #313c46;
  `}
	${(props) => props.gridArea && `grid-area:${props.gridArea}`};
`;

const FooterMobile = () => {
	const [openOutOfStockTooltip, , isOutOfStockTooltipVisible, Dropdown] = useDropdown();
	const addToCartButtonRef = useRef<HTMLDivElement>(null);

	const {
		useLegacyScreenshot,
		setCameraByName,
		getPDF,
		addToCart,
		product,
		price,
		isOutOfStock,
		groups,
		isSceneLoading,
		eventMessages,
		visibleEventMessages,
		isAddToCartLoading,
		sellerSettings,
		saveComposition,
		createQuote,
		isMandatoryPD,
		nftSettings
	} = useZakeke();

	const {
		setIsLoading,
		selectedGroupId,
		setSelectedGroupId,
		selectedAttributeId,
		setSelectedTemplateGroupId,
		selectedTemplateGroupId,
		selectedStepId,
		setSelectedAttributeId,
		priceFormatter,
		setIsQuoteLoading,
		isQuoteLoading,
		isViewerMode,
		isDraftEditor,
		isEditorMode,
		setTryOnMode,
		tryOnRef,
		setIsPDStartedFromCart,
		pdValue,
		isMobile
	} = useStore();

	const { showDialog, closeDialog } = useDialogManager();

	const isBuyVisibleForQuoteRule = product?.quoteRule ? product.quoteRule.allowAddToCart : true;

	const [disableButtonsByVisibleMessages, setDisableButtonsByVisibleMessages] = useState(false);

	useEffect(() => {
		if (visibleEventMessages && visibleEventMessages.some((msg) => msg.addToCartDisabledIfVisible))
			setDisableButtonsByVisibleMessages(true);
		else setDisableButtonsByVisibleMessages(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [visibleEventMessages]);

	const handleAddToCart = () => {
		const cartMessage = eventMessages?.find((message) => message.eventID === 4);
		if (isMandatoryPD && pdValue < 1) {
			setIsPDStartedFromCart(true);
			tryOnRef?.current?.setVisible?.(true);
			tryOnRef?.current?.changeMode?.(TryOnMode.PDTool);
			setTryOnMode(TryOnMode.PDTool);
			return;
		}
		if (cartMessage && cartMessage.visible && !isDraftEditor && !isEditorMode)
			showDialog(
				'question',
				<QuestionDialog
					alignButtons='center'
					eventMessage={cartMessage?.description}
					buttonNoLabel={T._('Cancel', 'Composer')}
					buttonYesLabel={T._('Add to cart', 'Composer')}
					onYesClick={() => {
						if (nftSettings && nftSettings.isNFTEnabled && !isDraftEditor)
							showDialog(
								'nft',
								<NftDialog
									nftTitle={T._(
										"You're purchasing a customized product together with an NFT.",
										'Composer'
									)}
									nftMessage={T._(
										'To confirm and mint your NFT you need an active wallet compatible with Ethereum. Confirm and add your email and wallet address.',
										'Composer'
									)}
									buttonNoLabel={T._('Skip and continue', 'Composer')}
									buttonYesLabel={T._('Confirm and Purchase', 'Composer')}
									price={nftSettings.priceToAdd + price}
									onYesClick={(nftForm: NftForm) => {
										closeDialog('nft');
										addToCart([], undefined, useLegacyScreenshot, nftForm);
									}}
									onNoClick={() => {
										closeDialog('nft');
										addToCart([], undefined, useLegacyScreenshot);
									}}
								/>
							);
						else addToCart([], undefined, useLegacyScreenshot);
						closeDialog('question');
					}}
				/>
			);
		else if (nftSettings && nftSettings.isNFTEnabled && !isDraftEditor)
			showDialog(
				'nft',
				<NftDialog
					nftTitle={T._("You're purchasing a customized product together with an NFT.", 'Composer')}
					nftMessage={T._(
						'To confirm and mint your NFT you need an active wallet compatible with Ethereum. Confirm and add your email and wallet address.',
						'Composer'
					)}
					price={nftSettings.priceToAdd + price}
					buttonNoLabel={T._('Skip and continue', 'Composer')}
					buttonYesLabel={T._('Confirm and Purchase', 'Composer')}
					onYesClick={(nftForm: NftForm) => {
						closeDialog('nft');
						addToCart([], undefined, useLegacyScreenshot, nftForm);
					}}
					onNoClick={() => {
						closeDialog('nft');
						addToCart([], undefined, useLegacyScreenshot);
					}}
				/>
			);
		else if (product && product.quantityRule)
			showDialog(
				'quantity',
				<QuantityDialog
					quantityRule={product.quantityRule}
					onClick={() => {
						closeDialog('quantity');
						addToCart([], undefined, useLegacyScreenshot);
					}}
				/>
			);
		else {
			addToCart([], undefined, useLegacyScreenshot);
		}
	};

	const showError = (error: string) => {
		showDialog('error', <ErrorDialog error={error} onCloseClick={() => closeDialog('error')} />);
	};

	const handleShareClick = async () => {
		setCameraByName('buy_screenshot_camera', false, false);
		showDialog('share', <ShareDialog />);
	};
	const handleSaveClick = async () => {
		showDialog('save', <SaveDesignsDraftDialog onCloseClick={() => closeDialog('save')} />);
	};
	const handlePdfClick = async () => {
		try {
			setIsLoading(true);
			const url = await getPDF();
			showDialog('pdf', <PdfDialog url={url} onCloseClick={() => closeDialog('pdf')} />);
		} catch (ex) {
			console.log(ex);
			showError(T._('Failed PDF generation', 'Composer'));
		} finally {
			setIsLoading(false);
		}
	};
	const handleBackClick = () => {
		setSelectedGroupId(null);

		// if (selectedAttributeId) {
		// 	setSelectedAttributeId(null);

		// 	const selectedCurrentGroup = groups.find((x) => x.id === selectedGroupId);
		// 	const selectedCurrentStep = selectedCurrentGroup?.steps.find((x) => x.id === selectedStepId);

		// 	if (
		// 		selectedCurrentGroup &&
		// 		((selectedCurrentGroup.attributes.length === 1 && selectedCurrentGroup.templateGroups.length === 0) ||
		// 			(selectedCurrentStep?.attributes.length === 1 && selectedCurrentStep.templateGroups.length === 0))
		// 	) {
		// 		setSelectedGroupId(null);
		// 	}
		// } else if (selectedTemplateGroupId) {
		// 	console.log('selectedTemplateGroupId');
		// 	setSelectedTemplateGroupId(null);

		// 	const selectedCurrentGroup = groups.find((x) => x.id === selectedGroupId);
		// 	const selectedCurrentStep = selectedCurrentGroup?.steps.find((x) => x.id === selectedStepId);

		// 	if (
		// 		selectedCurrentGroup &&
		// 		((selectedCurrentGroup.templateGroups.length === 1 && selectedCurrentGroup.attributes.length === 0) ||
		// 			(selectedCurrentStep?.templateGroups.length === 1 && selectedCurrentStep.attributes.length === 0))
		// 	) {
		// 		setSelectedGroupId(null);
		// 	}
		// } else if (selectedGroupId) {
		// 	setSelectedGroupId(null);
		// }
	};

	const handleSubmitRequestQuote = async (formData: any) => {
		let thereIsARequiredFormEmpty = formData.some((form: any) => form.required && form.value === '');
		if (thereIsARequiredFormEmpty)
			showDialog(
				'error',
				<ErrorDialog
					error={T._(
						'Failed to send the quotation since there is at least 1 required field empty.',
						'Composer'
					)}
					onCloseClick={() => closeDialog('error')}
				/>
			);
		else
			try {
				closeDialog('request-quotation');
				setIsQuoteLoading(true);
				setCameraByName('buy_screenshot_camera', false, false);
				await saveComposition();
				await createQuote(formData);
				showDialog(
					'message',
					<MessageDialog message={T._('Request for quotation sent successfully', 'Composer')} />
				);
				setIsQuoteLoading(false);
			} catch (ex) {
				console.error(ex);
				setIsQuoteLoading(false);
				showDialog(
					'error',
					<ErrorDialog
						error={T._(
							'An error occurred while sending request for quotation. Please try again.',
							'Composer'
						)}
						onCloseClick={() => closeDialog('error')}
					/>
				);
			}
	};

	const handleGetQuoteClick = async () => {
		let rule = product?.quoteRule;
		if (rule)
			showDialog(
				'request-quotation',
				<QuotationFormDialog getQuoteRule={rule} onFormSubmit={handleSubmitRequestQuote} />
			);
	};

	return (
		<>
			{!isSceneLoading && (
				<FooterMobileContainer isQuoteEnable={product?.quoteRule !== null}>
					<FooterMobileIcon gridArea='back' isHidden={selectedGroupId === null} onClick={handleBackClick}>
						{/* <AngleLeftSolid /> */}
						Back
					</FooterMobileIcon>

					{
						<FooterMobileIcon gridArea='pdf' onClick={handlePdfClick}>
							<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path opacity="0.5" d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z" fill="#" />
								<path d="M12.75 7C12.75 6.58579 12.4142 6.25 12 6.25C11.5858 6.25 11.25 6.58579 11.25 7L11.25 12.1893L9.53033 10.4697C9.23744 10.1768 8.76256 10.1768 8.46967 10.4697C8.17678 10.7626 8.17678 11.2374 8.46967 11.5303L11.4697 14.5303C11.6103 14.671 11.8011 14.75 12 14.75C12.1989 14.75 12.3897 14.671 12.5303 14.5303L15.5303 11.5303C15.8232 11.2374 15.8232 10.7626 15.5303 10.4697C15.2374 10.1768 14.7626 10.1768 14.4697 10.4697L12.75 12.1893V7Z" fill="#1C274C" />
								<path d="M8 16.25C7.58579 16.25 7.25 16.5858 7.25 17C7.25 17.4142 7.58579 17.75 8 17.75H16C16.4142 17.75 16.75 17.4142 16.75 17C16.75 16.5858 16.4142 16.25 16 16.25H8Z" fill="#1C274C" />
							</svg>
						</FooterMobileIcon>
					}

					{/* {!isDraftEditor &&
						!isEditorMode &&
						!isViewerMode &&
						sellerSettings &&
						sellerSettings.canSaveDraftComposition && (
							<FooterMobileIcon gridArea='save' onClick={handleSaveClick}>
								<SaveSolid />
							</FooterMobileIcon>
						)} */}

					{!isEditorMode && sellerSettings && sellerSettings.shareType !== 0 && (
						<FooterMobileIcon gridArea='share' onClick={handleShareClick}>
							<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path fill-rule="evenodd" clip-rule="evenodd" d="M13.803 5.33333C13.803 3.49238 15.3022 2 17.1515 2C19.0008 2 20.5 3.49238 20.5 5.33333C20.5 7.17428 19.0008 8.66667 17.1515 8.66667C16.2177 8.66667 15.3738 8.28596 14.7671 7.67347L10.1317 10.8295C10.1745 11.0425 10.197 11.2625 10.197 11.4872C10.197 11.9322 10.109 12.3576 9.94959 12.7464L15.0323 16.0858C15.6092 15.6161 16.3473 15.3333 17.1515 15.3333C19.0008 15.3333 20.5 16.8257 20.5 18.6667C20.5 20.5076 19.0008 22 17.1515 22C15.3022 22 13.803 20.5076 13.803 18.6667C13.803 18.1845 13.9062 17.7255 14.0917 17.3111L9.05007 13.9987C8.46196 14.5098 7.6916 14.8205 6.84848 14.8205C4.99917 14.8205 3.5 13.3281 3.5 11.4872C3.5 9.64623 4.99917 8.15385 6.84848 8.15385C7.9119 8.15385 8.85853 8.64725 9.47145 9.41518L13.9639 6.35642C13.8594 6.03359 13.803 5.6896 13.803 5.33333Z" fill="#1C274C" />
							</svg>
						</FooterMobileIcon>
					)}

					{isBuyVisibleForQuoteRule && !isViewerMode && (
						<FooterMobileIcon2
							gridArea='cart'
							isCart
							iconColor='white'
							color='white'
							ref={addToCartButtonRef}
							onPointerEnter={() => {
								if (isOutOfStock) openOutOfStockTooltip(addToCartButtonRef.current!, 'top', 'top');
							}}
							disabled={disableButtonsByVisibleMessages || isAddToCartLoading || isOutOfStock}
							backgroundColor='#269b88'
							onClick={!isAddToCartLoading ? () => handleAddToCart() : () => null}
						>
							{!isOutOfStock &&
								price !== null &&
								price > 0 &&
								(!sellerSettings || !sellerSettings.hidePrice) && (
									<PriceContainer style={{ fontSize: '18px' }} $isMobile={isMobile}>
										{priceFormatter.format(price)}
										{/* $757 */}
									</PriceContainer>
								)}

							{isOutOfStock && T._('OUT OF STOCK', 'Composer')}

							{!isOutOfStock &&
								!isAddToCartLoading &&
								(isDraftEditor || isEditorMode ? <SaveSolid /> : <CartSolid />)}
							{isAddToCartLoading && <TailSpin color='#FFFFFF' height='25px' />}
						</FooterMobileIcon2>
					)}
					{/* {product?.quoteRule && !isViewerMode && !isDraftEditor && !isEditorMode && (
						<FooterMobileIcon
							gridArea='quote'
							iconColor='white'
							color='white'
							style={{ fontSize: '14px' }}
							backgroundColor='#313c46'
							disabled={disableButtonsByVisibleMessages}
							onClick={handleGetQuoteClick}
						>
							{!isQuoteLoading && (
								<>
									<QuoteSolid />
									{T._('Get a Quote', 'Composer')}
								</>
							)}
							{isQuoteLoading && <TailSpin color='#FFFFFF' height='25px' />}
						</FooterMobileIcon>
					)} */}
				</FooterMobileContainer>
			)}

			{isOutOfStockTooltipVisible && (
				<Dropdown>
					<OutOfStockTooltipContent>
						{T._(
							'The configuration you have done is out-of-stock, please select different options to purchase this product.',
							'Composer'
						)}
					</OutOfStockTooltipContent>
				</Dropdown>
			)}
		</>
	);
};

export default FooterMobile;
