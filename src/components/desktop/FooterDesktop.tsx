import { TryOnMode, useZakeke } from '@zakeke/zakeke-configurator-react';
import { Button, Icon, TooltipContent } from 'components/Atomic';
import QuotationFormDialog from 'components/dialogs/QuotationFormDialog';
import SaveDesignsDraftDialog from 'components/dialogs/SaveDesignsDraftDialog';
import { T } from 'Helpers';
import { TailSpin } from 'react-loader-spinner';
import useStore from 'Store';
import styled from 'styled-components';
import { ReactComponent as PdfSolid } from '../../assets/icons/file-pdf-solid.svg';
import { ReactComponent as SaveSolid } from '../../assets/icons/save-solid.svg';
import { ReactComponent as ShareSolid } from '../../assets/icons/share-alt-square-solid.svg';
import { MessageDialog, QuestionDialog, useDialogManager } from '../dialogs/Dialogs';
import ErrorDialog from '../dialogs/ErrorDialog';
import PdfDialog from '../dialogs/PdfDialog';
import ShareDialog from '../dialogs/ShareDialog';
import {
	CustomQuotationConfirmMessage,
	ExtensionFieldItem,
	ExtensionFieldsContainer,
	PriceContainer,
	QuantityContainer
} from '../layout/SharedComponents';
import NumericInput from '../layout/NumericInput';
import NftDialog, { NftForm } from 'components/dialogs/NftDialog';
import useDropdown from 'hooks/useDropdown';
import { useEffect, useRef, useState } from 'react';

export const FooterContainer = styled.div`
	display: flex;
	flex-direction: row;
	height: 70px;
	background-color: white;
	padding-top: 10px;
`;

export const FooterRightElementsContainer = styled.div`
	display: flex;
	justify-content: flex-end;
	width: 100%;
	height: 70px;
	min-height: 70px;
	background-color: #fff;
	flex-direction: row;
	grid-gap: 10px;
	align-items: center;
	padding: 0px 15px;
	font-size: 14px;
	@media (max-width: 1024px) {
		min-height: 70px;
	}
`;

// Styled component for the container of the price information text
const PriceInfoTextContainer = styled.div`
	font-size: 14px;
`;

// Styled component for the content of the out-of-stock tooltip
const OutOfStockTooltipContent = styled(TooltipContent)`
	max-width: 400px;
`;

// Styled component for the "Add to Cart" button
const AddToCartButton = styled(Button)`
	min-width: 200px;
  background: #269b88 !important;

`;

// FooterDesktop component
const FooterDesktop = () => {
	// Custom hooks and state variables
	const [openOutOfStockTooltip, closeOutOfStockTooltip, isOutOfStockTooltipVisible, Dropdown] = useDropdown();
	const addToCartButtonRef = useRef<HTMLButtonElement>(null);
	const {
		useLegacyScreenshot,
		setCameraByName,
		getPDF,
		addToCart,
		isAddToCartLoading,
		sellerSettings,
		product,
		price,
		isOutOfStock,
		quantity,
		setQuantity,
		eventMessages,
		visibleEventMessages,
		additionalCustomProperties,
		saveComposition,
		createQuote,
		isMandatoryPD,
		nftSettings,
		isSceneLoading
	} = useZakeke();
	const {
		setIsLoading,
		priceFormatter,
		isQuoteLoading,
		setIsQuoteLoading,
		isViewerMode,
		isDraftEditor,
		isEditorMode,
		setTryOnMode,
		tryOnRef,
		setIsPDStartedFromCart,
		pdValue
	} = useStore();
	const { showDialog, closeDialog } = useDialogManager();
	const [disableButtonsByVisibleMessages, setDisableButtonsByVisibleMessages] = useState(false);
	const [quantityValue, setQuantityValue] = useState(
		product?.quantityRule && product.quantityRule?.minQuantity ? product.quantityRule.minQuantity : quantity
	);

	useEffect(() => {
		const delayInputTimeoutId = setTimeout(() => {
			if (!isSceneLoading) {
				if (
					product?.quantityRule &&
					product.quantityRule?.minQuantity &&
					quantityValue < product.quantityRule?.minQuantity
				) {
					setQuantityValue(product.quantityRule.minQuantity);
				} else if (
					product?.quantityRule &&
					product.quantityRule?.maxQuantity &&
					quantityValue > product.quantityRule?.maxQuantity
				) {
					setQuantityValue(product.quantityRule.maxQuantity);
				} else setQuantityValue(quantityValue);
			}
		}, 600);
		return () => clearTimeout(delayInputTimeoutId);
	}, [quantityValue, isSceneLoading, product?.quantityRule]);

	// Update the state variable disableButtonsByVisibleMessages based on visibleEventMessages
	useEffect(() => {
		if (visibleEventMessages && visibleEventMessages.some((msg) => msg.addToCartDisabledIfVisible))
			setDisableButtonsByVisibleMessages(true);
		else setDisableButtonsByVisibleMessages(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [visibleEventMessages]);

	// Handle the "Add to Cart" button click event
	const handleAddToCart = () => {
		if (product?.quantityRule) setQuantity(quantityValue);
		// Check if the product has mandatory personalization data and the value is less than 1
		if (isMandatoryPD && pdValue < 1) {
			setIsPDStartedFromCart(true);
			tryOnRef?.current?.setVisible?.(true);
			tryOnRef?.current?.changeMode?.(TryOnMode.PDTool);
			setTryOnMode(TryOnMode.PDTool);
			return;
		}

		// Check if there is a cart message visible and show a confirmation dialog
		const cartMessage = eventMessages?.find((message) => message.eventID === 4);
		if (cartMessage && cartMessage.visible && !isDraftEditor && !isEditorMode)
			showDialog(
				'question',
				<QuestionDialog
					alignButtons='center'
					eventMessage={cartMessage?.description}
					buttonNoLabel={T._('Cancel', 'Composer')}
					buttonYesLabel={T._('Add to cart', 'Composer')}
					onYesClick={() => {
						// Check if NFT is enabled and show the NFT dialog
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
						else addToCart([], undefined, useLegacyScreenshot);
						closeDialog('question');
					}}
				/>
			);
		// If NFT is enabled, show the NFT dialog
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
		// Otherwise, add the product to the cart
		else {
			addToCart([], undefined, useLegacyScreenshot);
		}
	};

	// Show an error dialog
	const showError = (error: string) => {
		showDialog('error', <ErrorDialog error={error} onCloseClick={() => closeDialog('error')} />);
	};

	// Handle the "Share" button click event
	const handleShareClick = async () => {
		setCameraByName('buy_screenshot_camera', false, false);
		showDialog('share', <ShareDialog />);
	};

	// Handle the "Save" button click event
	const handleSaveClick = async () => {
		showDialog('save', <SaveDesignsDraftDialog onCloseClick={() => closeDialog('save')} />);
	};

	// Handle the "PDF" button click event
	const handlePdfClick = async () => {
		try {
			setIsLoading(true);
			const url = await getPDF();
			showDialog('pdf', <PdfDialog url={url} onCloseClick={() => closeDialog('pdf')} />);
		} catch (ex) {
			console.error(ex);
			showError(T._('Failed PDF generation', 'Composer'));
		} finally {
			setIsLoading(false);
		}
	};

	// Handle the "Get a Quote" button click event
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
					<MessageDialog
						windowDecorator={CustomQuotationConfirmMessage}
						message={T._('Request for quotation sent successfully', 'Composer')}
					/>
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

	// Handle the "Get Quote" button click event
	const handleGetQuoteClick = async () => {
		let rule = product?.quoteRule;
		if (rule)
			showDialog(
				'request-quotation',
				<QuotationFormDialog getQuoteRule={rule} onFormSubmit={handleSubmitRequestQuote} />
			);
	};

	// Check if the "Add to Cart" button should be visible based on the quote rule
	const isBuyVisibleForQuoteRule = product?.quoteRule ? product.quoteRule.allowAddToCart : true;

	return (
		<FooterContainer>
			{T.translations?.statics && (
				<>
					{/* Quantity input */}
					{product && product.quantityRule && (
						<QuantityContainer>
							<label>{T._d('Quantity')}</label>
							<NumericInput
								value={quantityValue}
								readOnly={product.quantityRule && (product.quantityRule.step === null || product.quantityRule.step === 0) ? false : true}
								onChange={(e: any) => {
									if (e.currentTarget.value === '')
										setQuantityValue(product?.quantityRule?.minQuantity ?? 1);
									else setQuantityValue(parseInt(e.currentTarget.value));
								}}
								min={
									product.quantityRule.minQuantity != null
										? Math.max(product.quantityRule.step || 1, product.quantityRule.minQuantity)
										: product.quantityRule.step || 1
								}
								max={
									product.quantityRule.maxQuantity != null
										? product.quantityRule.maxQuantity
										: undefined
								}
								step={product.quantityRule.step != null ? product.quantityRule.step : 1}
							/>
						</QuantityContainer>
					)}

					{/* Right elements container */}
					<FooterRightElementsContainer className='right-footer'>
						{/* Extension Fields */}
						{additionalCustomProperties && (
							<ExtensionFieldsContainer>
								{additionalCustomProperties.map(
									(
										extensionField: {
											name: string;
											value: number;
											label: string;
											formatString: string;
										},
										index
									) => {
										return (
											<ExtensionFieldItem key={index}>
												<span>{T._d(extensionField.label)}</span>
												<div>
													{/* {formatString(extensionField.formatString, extensionField.value.toString())} */}
													{extensionField.value}
												</div>
											</ExtensionFieldItem>
										);
									}
								)}
							</ExtensionFieldsContainer>
						)}

						{/* Price */}
						{price !== null && price > 0 && (!sellerSettings || !sellerSettings.hidePrice) && (
							<PriceContainer>
								{!isOutOfStock && priceFormatter.format(price)}
								{sellerSettings && sellerSettings.priceInfoText && (
									<PriceInfoTextContainer
										dangerouslySetInnerHTML={{ __html: sellerSettings.priceInfoText }}
									/>
								)}
							</PriceContainer>
						)}
						{/* Add to cart */}
						{isBuyVisibleForQuoteRule && !isViewerMode && (
							<AddToCartButton
								ref={addToCartButtonRef}
								onPointerEnter={() => {
									if (isOutOfStock)
										openOutOfStockTooltip(addToCartButtonRef.current!, 'top', 'top');
								}}
								onPointerLeave={() => {
									closeOutOfStockTooltip();
								}}
								disabled={disableButtonsByVisibleMessages || isAddToCartLoading || isOutOfStock}
								primary
								onClick={!isAddToCartLoading ? () => handleAddToCart() : () => null}
							>
								{isAddToCartLoading && <TailSpin color='#ffff' height='25px' />}
								{!isAddToCartLoading && !isOutOfStock && (
									<span>
										{isDraftEditor || isEditorMode
											? T._('Save', 'Composer')
											: T._('Add to cart', 'Composer')}
									</span>
								)}
								{!isAddToCartLoading && isOutOfStock && <span>{T._('OUT OF STOCK', 'Composer')}</span>}
							</AddToCartButton>
						)}
						{/* PDF preview */}
						<Button key={'pdf'} onClick={() => handlePdfClick()}>
							{/* <Icon>
								<PdfSolid />
							</Icon> */}
							<svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path opacity="0.5" d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z" fill="#" />
								<path d="M12.75 7C12.75 6.58579 12.4142 6.25 12 6.25C11.5858 6.25 11.25 6.58579 11.25 7L11.25 12.1893L9.53033 10.4697C9.23744 10.1768 8.76256 10.1768 8.46967 10.4697C8.17678 10.7626 8.17678 11.2374 8.46967 11.5303L11.4697 14.5303C11.6103 14.671 11.8011 14.75 12 14.75C12.1989 14.75 12.3897 14.671 12.5303 14.5303L15.5303 11.5303C15.8232 11.2374 15.8232 10.7626 15.5303 10.4697C15.2374 10.1768 14.7626 10.1768 14.4697 10.4697L12.75 12.1893V7Z" fill="#1C274C" />
								<path d="M8 16.25C7.58579 16.25 7.25 16.5858 7.25 17C7.25 17.4142 7.58579 17.75 8 17.75H16C16.4142 17.75 16.75 17.4142 16.75 17C16.75 16.5858 16.4142 16.25 16 16.25H8Z" fill="#1C274C" />
							</svg>
							
						</Button>

						{/* Save composition */}
						{!isDraftEditor &&
							!isEditorMode &&
							!isViewerMode &&
							sellerSettings &&
							sellerSettings.canSaveDraftComposition && (
								<Button key={'save'} onClick={() => handleSaveClick()}>
								<svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path fill-rule="evenodd" clip-rule="evenodd" d="M13.803 5.33333C13.803 3.49238 15.3022 2 17.1515 2C19.0008 2 20.5 3.49238 20.5 5.33333C20.5 7.17428 19.0008 8.66667 17.1515 8.66667C16.2177 8.66667 15.3738 8.28596 14.7671 7.67347L10.1317 10.8295C10.1745 11.0425 10.197 11.2625 10.197 11.4872C10.197 11.9322 10.109 12.3576 9.94959 12.7464L15.0323 16.0858C15.6092 15.6161 16.3473 15.3333 17.1515 15.3333C19.0008 15.3333 20.5 16.8257 20.5 18.6667C20.5 20.5076 19.0008 22 17.1515 22C15.3022 22 13.803 20.5076 13.803 18.6667C13.803 18.1845 13.9062 17.7255 14.0917 17.3111L9.05007 13.9987C8.46196 14.5098 7.6916 14.8205 6.84848 14.8205C4.99917 14.8205 3.5 13.3281 3.5 11.4872C3.5 9.64623 4.99917 8.15385 6.84848 8.15385C7.9119 8.15385 8.85853 8.64725 9.47145 9.41518L13.9639 6.35642C13.8594 6.03359 13.803 5.6896 13.803 5.33333Z" fill="#1C274C" />
								</svg>
								</Button>
							)}

						{/* Share */}
						{sellerSettings && sellerSettings.shareType !== 0 && !isEditorMode && (
							<Button key={'share'} onClick={() => handleShareClick()}>
								<svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path fill-rule="evenodd" clip-rule="evenodd" d="M13.803 5.33333C13.803 3.49238 15.3022 2 17.1515 2C19.0008 2 20.5 3.49238 20.5 5.33333C20.5 7.17428 19.0008 8.66667 17.1515 8.66667C16.2177 8.66667 15.3738 8.28596 14.7671 7.67347L10.1317 10.8295C10.1745 11.0425 10.197 11.2625 10.197 11.4872C10.197 11.9322 10.109 12.3576 9.94959 12.7464L15.0323 16.0858C15.6092 15.6161 16.3473 15.3333 17.1515 15.3333C19.0008 15.3333 20.5 16.8257 20.5 18.6667C20.5 20.5076 19.0008 22 17.1515 22C15.3022 22 13.803 20.5076 13.803 18.6667C13.803 18.1845 13.9062 17.7255 14.0917 17.3111L9.05007 13.9987C8.46196 14.5098 7.6916 14.8205 6.84848 14.8205C4.99917 14.8205 3.5 13.3281 3.5 11.4872C3.5 9.64623 4.99917 8.15385 6.84848 8.15385C7.9119 8.15385 8.85853 8.64725 9.47145 9.41518L13.9639 6.35642C13.8594 6.03359 13.803 5.6896 13.803 5.33333Z" fill="#1C274C" />
								</svg>
							</Button>
						)}

						{/* Get a quote */}
						{product?.quoteRule && !isViewerMode && !isDraftEditor && !isEditorMode && (
							<Button
								disabled={disableButtonsByVisibleMessages}
								key={'quote'}
								primary
								onClick={() => handleGetQuoteClick()}
							>
								{isQuoteLoading && <TailSpin color='#FFFFFF' height='25px' />}
								{!isQuoteLoading && <span>{T._('Get a quote', 'Composer')}</span>}
							</Button>
						)}


					</FooterRightElementsContainer>

					{/* Out-of-stock tooltip */}
					{isOutOfStockTooltipVisible && isOutOfStock && (
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
			)}
		</FooterContainer>
	);
};

export default FooterDesktop;
