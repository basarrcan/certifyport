
export async function confirmTransaction(
    transactionResult,
    waitForConfirm,
    startFromBlockNumber,
    communicationSettings,
  ) {
    // use default communicationSettings or whatever was passed-in in as chainSettings (via constructor)
    const useCommunicationSettings = communicationSettings ?? {
      ...EosChainState.defaultCommunicationSettings,
      ...this.chainSettings?.communicationSettings,
    }
    const { blocksToCheck, checkInterval, getBlockAttempts: maxBlockReadAttempts } = useCommunicationSettings

    if (
      waitForConfirm !== ConfirmType.None &&
      waitForConfirm !== ConfirmType.After001 &&
      waitForConfirm !== ConfirmType.Final
    ) {
      throwNewError(`Specified ConfirmType ${waitForConfirm} not supported`)
    }

    if (!startFromBlockNumber || startFromBlockNumber <= 1) {
      throwNewError('A valid number (greater than 1) must be provided for startFromBlockNumber param')
    }

    return new Promise((resolve, reject) => {
      const getBlockAttempt = 1
      const { transactionId } = transactionResult || {}
      // starting block number should be the block number in the transaction receipt. If block number not in transaction, use preCommitHeadBlockNum
      const nextBlockNumToCheck = startFromBlockNumber - 1

      // Schedule first call of recursive function
      // if will keep reading blocks from the chain (every checkInterval) until we find the transationId in a block
      // ... or until we reach a max number of blocks or block read attempts
      setTimeout(
        async () =>
          checkIfAwaitConditionsReached(
            reject,
            resolve,
            blocksToCheck,
            checkInterval,
            getBlockAttempt,
            maxBlockReadAttempts,
            nextBlockNumToCheck,
            startFromBlockNumber,
            null,
            transactionId,
            transactionResult,
            waitForConfirm,
          ),
        checkInterval,
      )
    })
  }


async function checkIfAwaitConditionsReached(
    reject,
    resolve,
    blocksToCheck,
    checkInterval,
    getBlockAttempt,
    maxBlockReadAttempts,
    blockNumToCheck,
    startFromBlockNumber,
    transactionBlockNumberParammber,
    transactionId,
    transactionResult,
    waitForConfirm,
  ) {
    let transactionBlockNumber = transactionBlockNumberParam
    let nextGetBlockAttempt
    let nextBlockNumToCheck
    let possibleTransactionBlock
    // let transactionHistoryRecord: any
    try {
      // attempt to get the transaction from the history plug-in - only supported by some block producers
      // try {
      //   // we only need to get the history record if we dont yet know what block the tx is in
      //   if (!transactionBlockNumber) {
      //     transactionHistoryRecord = await this.rpc.history_get_transaction(transactionId)
      //     transactionBlockNumber = transactionHistoryRecord?.block_num
      //   }
      // } catch (error) {
      //   // if can't find - RpcError.json.code = 500 RpcError.json.error.name = 'tx_not_found' //
      //   // if no history plug-in - 404
      //   // do nothing - EOS endpoint doesnt have history plug-in installed or transactionId can't be found
      // }

      // if we cant get the transaction, read the next block and check if it has our transaction
      if (!transactionBlockNumber) {
        possibleTransactionBlock = await this.rpc.get_block(blockNumToCheck)
        if (this.blockHasTransaction(possibleTransactionBlock, transactionId)) {
          transactionBlockNumber = possibleTransactionBlock.block_num
        }
      }
      // check if we've met our limit rules
      const hasReachedConfirmLevel = await this.hasReachedConfirmLevel(
        transactionBlockNumber,
        waitForConfirm,
        blocksToCheck,
      )
      if (hasReachedConfirmLevel) {
        this.resolveAwaitTransaction(resolve, transactionResult)
        return
      }
      nextBlockNumToCheck = blockNumToCheck + 1
    } catch (error) {
      const mappedError = mapChainError(error)
      if (mappedError.errorType === ChainErrorType.BlockDoesNotExist) {
        // Try to read the specific block - up to getBlockAttempts times
        if (getBlockAttempt >= maxBlockReadAttempts) {
          this.rejectAwaitTransaction(
            reject,
            ChainErrorDetailCode.MaxBlockReadAttemptsTimeout,
            `Await Transaction Failure: Failure to find a block, after ${getBlockAttempt} attempts to check block ${blockNumToCheck}.`,
            error,
          )
          return
        }
        nextGetBlockAttempt = getBlockAttempt + 1
      } else {
        // re-throw error - not one we can handle here
        throw mappedError
      }
    }

    if (nextBlockNumToCheck && nextBlockNumToCheck > startFromBlockNumber + blocksToCheck) {
      this.rejectAwaitTransaction(
        reject,
        ChainErrorDetailCode.ConfirmTransactionTimeout,
        `Await Transaction Timeout: Waited for ${blocksToCheck} blocks ~(${(checkInterval / 1000) *
          blocksToCheck} seconds) starting with block num: ${startFromBlockNumber}. This does not mean the transaction failed just that the transaction wasn't found in a block before timeout`,
        null,
      )
      return
    }
    // not yet reached limit - set a timer to call this function again (in checkInterval ms)
    const checkAgainInMs = checkInterval
    setTimeout(
      async () =>
        this.checkIfAwaitConditionsReached(
          reject,
          resolve,
          blocksToCheck,
          checkInterval,
          nextGetBlockAttempt,
          maxBlockReadAttempts,
          nextBlockNumToCheck,
          startFromBlockNumber,
          transactionBlockNumber,
          transactionId,
          transactionResult,
          waitForConfirm,
        ),
      checkAgainInMs,
    )
  }